/* Supabase 封装：从 config 创建客户端，封装 RPC 调用
 * 支持「本地测试模式」(testMode=true)：无需真实后端即可走通全流程，
 * 访问码用量 / 题库 / 分享结果都存浏览器 localStorage，方便上线前体验。
 *
 * 题库相关（多测评）：
 *   getQuizzes()      列出全部题库（内置种子 + 后台新增 - 已删）
 *   getActiveQuiz()   取当前启用的那一套（用户端测的就是它）
 *   setActive(id)     切换当前启用题库
 *   addQuiz(q)        新增题库（自动识别 resultMode）
 *   deleteQuiz(id)    删除题库（内置库标记删除，用户库直接移除）
 */
(function () {
  const C = window.CONFIG;
  let _client = null;

  // ---------------- 本地测试模式 ----------------
  const TEST = {
    KEY_CODES: "mq_codes",      // 各测试码 {code:{quizId,used,max}}
    KEY_RES: "mq_test_res_",    // mq_test_res_<token> => 结果对象
    KEY_ACTIVE: "mq_active_id", // 当前启用题库 id
    KEY_USER_Q: "mq_user_quizzes", // 后台新增的题库数组
    KEY_DEL_Q: "mq_del_quizzes",   // 被删除的内置题库 id 数组

    codes() {
      try { return JSON.parse(localStorage.getItem(TEST.KEY_CODES) || "{}"); }
      catch { return {}; }
    },
    saveCodes(map) { localStorage.setItem(TEST.KEY_CODES, JSON.stringify(map)); },
    // 默认绑定题：取当前启用题，再退而求其次取 defaultActiveId
    defaultQuizId() {
      const a = TEST.getActiveQuiz();
      return (a && a.id) || (C && C.defaultActiveId) || "";
    },

    validateCode(code) {
      const map = TEST.codes();
      let e = map[code];
      if (!e) {
        // 测试模式：任意码均可进，自动绑定默认启用题（含 TEST2026）
        e = { quizId: TEST.defaultQuizId(), used: 0, max: 3 };
        map[code] = e;
      }
      if (e.used >= e.max) return Promise.resolve({ ok: false, reason: "used_up" });
      e.used += 1; TEST.saveCodes(map);
      const qz = TEST.getQuizById(e.quizId) || TEST.getActiveQuiz();
      return Promise.resolve({ ok: true, remaining: e.max - e.used, quizId: qz ? qz.id : e.quizId });
    },
    createResult(payload) {
      const token = "T" + Math.random().toString(36).slice(2, 10).toUpperCase();
      localStorage.setItem(TEST.KEY_RES + token, JSON.stringify(payload));
      return Promise.resolve({ token });
    },
    getResult(token) {
      const raw = localStorage.getItem(TEST.KEY_RES + token);
      return Promise.resolve(raw ? JSON.parse(raw) : null);
    },
    adminGenerate(n, note, quizId) {
      const bid = (quizId && TEST.getQuizById(quizId)) ? quizId : TEST.defaultQuizId();
      const map = TEST.codes();
      const codes = [];
      for (let i = 0; i < n; i++) {
        const c = "DEMO" + Math.random().toString(36).slice(2, 8).toUpperCase();
        codes.push(c);
        map[c] = { quizId: bid, used: 0, max: 3 };
      }
      TEST.saveCodes(map);
      return Promise.resolve({ ok: true, codes, note: "测试模式：仅本地演示，未写入数据库" });
    },
    adminList() {
      const map = TEST.codes();
      const rows = Object.keys(map).map((code) => {
        const e = map[code];
        const qz = TEST.getQuizById(e.quizId);
        return {
          code, used: e.used, max_uses: e.max,
          note: qz ? qz.title : (e.quizId || "默认"),
          quiz_id: e.quizId, created_at: new Date().toISOString()
        };
      });
      return Promise.resolve({ ok: true, rows, note: "测试模式：本地演示码（每个码已绑定生成的测评）" });
    },
    getQuizById(id) {
      const list = TEST.getQuizzes();
      return list.find((q) => q.id === id) || null;
    },

    // ---- 题库 ----
    getQuizzes() {
      const seed = window.QUIZZES || [];
      let del = [];
      try { del = JSON.parse(localStorage.getItem(TEST.KEY_DEL_Q) || "[]"); } catch { del = []; }
      let user = [];
      try { user = JSON.parse(localStorage.getItem(TEST.KEY_USER_Q) || "[]"); } catch { user = []; }
      const kept = seed.filter((q) => !del.includes(q.id));
      return kept.concat(user);
    },
    getActiveQuiz() {
      const list = TEST.getQuizzes();
      const id = localStorage.getItem(TEST.KEY_ACTIVE) || (C && C.defaultActiveId) || "";
      return list.find((q) => q.id === id) || list[0] || null;
    },
    setActive(id) {
      localStorage.setItem(TEST.KEY_ACTIVE, id);
      return Promise.resolve({ ok: true });
    },
    detectMode(q) {
      let hasScores = false;
      (q.questions || []).forEach((qt) =>
        (qt.options || []).forEach((o) => { if (o.scores) hasScores = true; })
      );
      return hasScores ? "type" : "level";
    },
    addQuiz(q) {
      q = JSON.parse(JSON.stringify(q)); // 深拷贝，避免外部引用污染
      if (!q.id) q.id = "q_" + Math.random().toString(36).slice(2, 8);
      const list = TEST.getQuizzes();
      if (list.some((x) => x.id === q.id)) return Promise.resolve({ ok: false, reason: "duplicate", msg: "id 已存在" });
      if (!q.resultMode) q.resultMode = TEST.detectMode(q);
      let user = [];
      try { user = JSON.parse(localStorage.getItem(TEST.KEY_USER_Q) || "[]"); } catch { user = []; }
      user.push(q);
      localStorage.setItem(TEST.KEY_USER_Q, JSON.stringify(user));
      // 若此前被标记删除，移除删除标记
      let del = [];
      try { del = JSON.parse(localStorage.getItem(TEST.KEY_DEL_Q) || "[]"); } catch { del = []; }
      del = del.filter((x) => x !== q.id);
      localStorage.setItem(TEST.KEY_DEL_Q, JSON.stringify(del));
      return Promise.resolve({ ok: true, quiz: q });
    },
    deleteQuiz(id) {
      const seed = (window.QUIZZES || []).map((q) => q.id);
      if (seed.includes(id)) {
        let del = [];
        try { del = JSON.parse(localStorage.getItem(TEST.KEY_DEL_Q) || "[]"); } catch { del = []; }
        if (!del.includes(id)) del.push(id);
        localStorage.setItem(TEST.KEY_DEL_Q, JSON.stringify(del));
      } else {
        let user = [];
        try { user = JSON.parse(localStorage.getItem(TEST.KEY_USER_Q) || "[]"); } catch { user = []; }
        user = user.filter((q) => q.id !== id);
        localStorage.setItem(TEST.KEY_USER_Q, JSON.stringify(user));
      }
      return Promise.resolve({ ok: true });
    }
  };

  if (C.testMode) {
    // 测试模式：直接使用本地模拟，不创建 Supabase 客户端
    window.SB = {
      isTest: true,
      validateCode: TEST.validateCode,
      createResult: TEST.createResult,
      getResult: TEST.getResult,
      adminGenerate: TEST.adminGenerate,
      adminList: TEST.adminList,
      // 题库
      getQuizzes: TEST.getQuizzes,
      getActiveQuiz: TEST.getActiveQuiz,
      getQuizById: TEST.getQuizById,
      setActive: TEST.setActive,
      addQuiz: TEST.addQuiz,
      deleteQuiz: TEST.deleteQuiz
    };
    return;
  }

  // ---------------- 真实 Supabase 模式 ----------------
  function client() {
    if (!_client) {
      if (!C || !C.supabaseUrl || C.supabaseUrl.includes("YOUR-PROJECT")) {
        throw new Error("请在 js/config.js 填写 supabaseUrl 和 supabaseAnonKey，或开启 testMode");
      }
      if (!window.supabase || typeof window.supabase.createClient !== "function") {
        throw new Error("依赖库 lib/supabase.min.js 没加载成功（请用 http:// 方式打开，别直接双击本地文件）");
      }
      _client = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey);
    }
    return _client;
  }

  async function rpc(fn, params) {
    const { data, error } = await client().rpc(fn, params);
    if (error) throw error;
    return data;
  }

  // 真实模式下，题库来自 Supabase 表 + RPC（部署时执行 schema.sql 中的 quizzes 相关部分）
  // 注意：getActiveQuiz 在真实模式为异步（需 await），主站 app.js 已兼容 await。
  window.SB = {
    isTest: false,
    client,
    validateCode: (code) => rpc("validate_code", { p_code: code }),
    createResult: (payload) => rpc("create_result", { p_payload: payload }),
    getResult: (token) => rpc("get_result", { p_token: token }),
    adminGenerate: (n, note, quizId) => rpc("admin_generate", { p_key: C.adminKey, p_n: n, p_note: note || "", p_quiz_id: quizId || null }),
    adminList: () => rpc("admin_list", { p_key: C.adminKey }),
    // 题库（真实模式）
    getQuizzes: () => rpc("get_quizzes", {}),
    getActiveQuiz: () => rpc("get_active_quiz", {}),
    getQuizById: (id) => rpc("get_quiz", { p_id: id }),
    setActive: (id) => rpc("set_active_quiz", { p_key: C.adminKey, p_id: id }),
    addQuiz: (q) => rpc("admin_upsert_quiz", { p_key: C.adminKey, p_quiz: q }),
    deleteQuiz: (id) => rpc("admin_delete_quiz", { p_key: C.adminKey, p_id: id })
  };
})();
