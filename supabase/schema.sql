-- ============================================================
--  测评网站  Supabase 数据库初始化
--  执行方式：Supabase 控制台 → SQL Editor → 粘贴全部 → Run
--  注意：把下面 app.admin_key 的值改成与 config.js 的 adminKey 一致
-- ============================================================

-- 访问码：每码默认可测 max_uses 次，可绑定某一套题库（quiz_id 为空=用默认启用题）
create table if not exists access_codes (
  code      text primary key,
  max_uses  int not null default 3,
  used      int not null default 0,
  quiz_id   text,
  note      text,
  created_at timestamptz not null default now()
);
-- 已存在旧表时补列（幂等）
alter table access_codes add column if not exists quiz_id text;

-- 分享结果：token 对应一份结果快照
create table if not exists results (
  token      text primary key,
  payload    jsonb not null,
  created_at timestamptz not null default now()
);

-- 禁止 anon 直接读写，只允许经 RPC（security definer）访问
alter table access_codes enable row level security;
alter table results      enable row level security;

-- 设置管理员密钥（改成你自己的！）
-- 也可在 Supabase 控制台 Database → Parameters 搜索 app.admin_key 设置
alter database postgres set app.admin_key = 'CHANGE_ME_ADMIN_KEY';

-- ---------- RPC 函数 ----------

-- 校验访问码并原子扣 1 次，返回 {ok, remaining, quiz_id} 或 {ok:false, reason}
create or replace function validate_code(p_code text)
returns jsonb language plpgsql security definer as $$
declare v_rem int; v_qid text;
begin
  update access_codes set used = used + 1
   where code = p_code and used < max_uses
   returning (max_uses - used), quiz_id into v_rem, v_qid;

  if v_rem is null then
    if exists (select 1 from access_codes where code = p_code) then
      return jsonb_build_object('ok', false, 'reason', 'used_up');
    else
      return jsonb_build_object('ok', false, 'reason', 'invalid');
    end if;
  end if;
  return jsonb_build_object('ok', true, 'remaining', v_rem, 'quiz_id', v_qid);
end;
$$;

-- 保存结果，返回 {token}
create or replace function create_result(p_payload jsonb)
returns jsonb language plpgsql security definer as $$
declare v_token text;
begin
  v_token := replace(gen_random_uuid()::text, '-', '');
  insert into results (token, payload) values (v_token, p_payload);
  return jsonb_build_object('token', v_token);
end;
$$;

-- 按 token 读取结果（公开只读）
create or replace function get_result(p_token text)
returns jsonb language plpgsql security definer as $$
declare r jsonb;
begin
  select payload into r from results where token = p_token;
  return coalesce(r, 'null');
end;
$$;

-- 后台：批量生成访问码（可绑定某套题库 p_quiz_id，为空则走默认启用题）
create or replace function admin_generate(p_key text, p_n int, p_note text, p_quiz_id text default null)
returns jsonb language plpgsql security definer as $$
begin
  if p_key is distinct from coalesce(current_setting('app.admin_key', true), '') then
    return jsonb_build_object('ok', false, 'reason', 'bad_key');
  end if;
  insert into access_codes (code, note, quiz_id)
  select substring(md5(random()::text || clock_timestamp()::text), 1, 8), p_note, nullif(p_quiz_id, '')
  from generate_series(1, p_n);
  return jsonb_build_object('ok', true, 'count', p_n);
end;
$$;

-- 后台：列出所有码及用量
create or replace function admin_list(p_key text)
returns jsonb language plpgsql security definer as $$
begin
  if p_key is distinct from coalesce(current_setting('app.admin_key', true), '') then
    return jsonb_build_object('ok', false, 'reason', 'bad_key');
  end if;
  return (
    select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    from (
      select code, used, max_uses, quiz_id, note, created_at
      from access_codes
      order by created_at desc
      limit 500
    ) t
  );
end;
$$;

-- 授权 anon 调用以上 RPC
grant execute on function validate_code(text)            to anon;
grant execute on function create_result(jsonb)          to anon;
grant execute on function get_result(text)              to anon;
grant execute on function admin_generate(text, int, text) to anon;
grant execute on function admin_list(text)              to anon;

-- ============================================================
--  多题库：quizzes 表（每套测评完整存为 jsonb）
-- ============================================================
create table if not exists quizzes (
  id         text primary key,
  data       jsonb not null,          -- 整套题库（title/intro/questions/levels/types...）
  is_active  boolean not null default false,
  created_at timestamptz not null default now()
);

alter table quizzes enable row level security;

-- 列出全部题库（返回 data 数组）
create or replace function get_quizzes()
returns jsonb language sql security definer as $$
  select coalesce(jsonb_agg(data order by created_at), '[]'::jsonb) from quizzes;
$$;

-- 取当前启用的题库（无则取第一个）
create or replace function get_active_quiz()
returns jsonb language sql security definer as $$
  select data from quizzes where is_active is true
  union all
  select data from quizzes order by created_at limit 1
  limit 1;
$$;

-- 按 id 取某套题库（用户输码后，按码绑定的 quiz_id 取对应测评）
create or replace function get_quiz(p_id text)
returns jsonb language sql security definer as $$
  select data from quizzes where id = p_id;
$$;

-- 后台：切换启用题库
create or replace function set_active_quiz(p_key text, p_id text)
returns jsonb language plpgsql security definer as $$
begin
  if p_key is distinct from coalesce(current_setting('app.admin_key', true), '') then
    return jsonb_build_object('ok', false, 'reason', 'bad_key');
  end if;
  update quizzes set is_active = false;
  update quizzes set is_active = true where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- 后台：新增/更新题库（p_quiz 为整套题库 jsonb，以 p_quiz->>'id' 为主键）
create or replace function admin_upsert_quiz(p_key text, p_quiz jsonb)
returns jsonb language plpgsql security definer as $$
declare v_id text := p_quiz->>'id';
begin
  if p_key is distinct from coalesce(current_setting('app.admin_key', true), '') then
    return jsonb_build_object('ok', false, 'reason', 'bad_key');
  end if;
  if v_id is null or v_id = '' then
    return jsonb_build_object('ok', false, 'reason', 'no_id');
  end if;
  insert into quizzes (id, data) values (v_id, p_quiz)
  on conflict (id) do update set data = excluded.data, is_active = false;
  return jsonb_build_object('ok', true);
end;
$$;

-- 后台：删除题库
create or replace function admin_delete_quiz(p_key text, p_id text)
returns jsonb language plpgsql security definer as $$
begin
  if p_key is distinct from coalesce(current_setting('app.admin_key', true), '') then
    return jsonb_build_object('ok', false, 'reason', 'bad_key');
  end if;
  delete from quizzes where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function get_quizzes()               to anon;
grant execute on function get_active_quiz()           to anon;
grant execute on function get_quiz(text)               to anon;
grant execute on function set_active_quiz(text, text) to anon;
grant execute on function admin_upsert_quiz(text, jsonb) to anon;
grant execute on function admin_delete_quiz(text, text) to anon;
