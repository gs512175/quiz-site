/* 管理后台：密钥进入；题库管理（列表/切换/导入/删除）+ 访问码生成 */
(function () {
  const C = window.CONFIG;
  const $ = (id) => document.getElementById(id);
  let key = sessionStorage.getItem("mq_admin_key") || "";
  let QBYID = {}; // 题库 id -> 标题，供访问码列表显示绑定测评

  function show(id) {
    $("admin-login").classList.toggle("hidden", id !== "login");
    $("admin-dash").classList.toggle("hidden", id !== "dash");
  }

  function setMsg(el, text, type) {
    el.textContent = text || "";
    el.className = "msg" + (type ? " " + type : "");
  }

  async function login() {
    key = $("admin-key").value.trim();
    if (!key) { setMsg($("login-msg"), "请输入密钥", "err"); return; }
    if (!window.SB) { setMsg($("login-msg"), "系统未就绪，请刷新页面", "err"); return; }
    // 测试模式不校验密钥，任意输入直接进入，方便体验后台
    if (window.SB.isTest) {
      C.adminKey = key;
      sessionStorage.setItem("mq_admin_key", key);
      setMsg($("login-msg"), "");
      show("dash");
      await renderQuizList();
      await refresh();
      return;
    }
    // 真实模式：用密钥调用后台校验
    C.adminKey = key;
    setMsg($("login-msg"), "校验中…");
    try {
      const r = await window.SB.adminList();
      if (!r || r.ok === false) { setMsg($("login-msg"), "密钥错误", "err"); return; }
      sessionStorage.setItem("mq_admin_key", key);
      show("dash");
      await renderQuizList();
      await refresh();
    } catch (e) {
      const m = (e && (e.message || e.error_description || e.hint || String(e))) || "未知错误";
      const st = e && (e.status || e.code) ? "(" + (e.status || e.code) + ") " : "";
      setMsg($("login-msg"), "连接失败 " + st + m, "err");
      console.error("admin login error:", e);
    }
  }

  // ---------------- 题库管理 ----------------
  // 填充「绑定测评」下拉：空选项=默认（跟随已启用），其余为各套题库
  function fillQuizSelect(list, activeId) {
    const sel = $("gen-quiz");
    if (!sel) return;
    const prev = sel.value;
    let html = "<option value=''>默认测评" + (activeId && QBYID[activeId] ? "（" + esc(QBYID[activeId]) + "）" : "") + "</option>";
    list.forEach((q) => {
      html += "<option value='" + esc(q.id) + "'>" + esc(q.title || q.id) + (q.id === activeId ? " ✓已启用" : "") + "</option>";
    });
    sel.innerHTML = html;
    if (prev && list.some((q) => q.id === prev)) sel.value = prev;
  }

  async function renderQuizList() {
    try {
      const list = await window.SB.getQuizzes();
      const active = await window.SB.getActiveQuiz();
      const activeId = active ? active.id : "";
      QBYID = {};
      list.forEach((q) => { QBYID[q.id] = q.title || q.id; });
      fillQuizSelect(list, activeId);
      if (!list.length) {
        $("quiz-list").innerHTML = "<p class='muted'>暂无题库，下面导入一个吧</p>";
        return;
      }
      let html = "";
      list.forEach((q) => {
        const isActive = q.id === activeId;
        const mode = q.resultMode === "type" ? "type" : "level";
        html += "<div class='quiz-row'>" +
          "<div class='quiz-meta'>" +
            "<span class='quiz-name'>" + esc(q.title || q.id) + "</span>" +
            "<span class='quiz-mode mode-" + mode + "'>" + mode + "</span>" +
            (isActive ? "<span class='quiz-on'>● 已启用</span>" : "") +
          "</div>" +
          "<div class='quiz-actions'>" +
            (isActive ? "" : "<button class='btn btn-ghost sm' data-action='active' data-id='" + esc(q.id) + "'>启用</button>") +
            "<button class='btn btn-ghost sm danger' data-action='del' data-id='" + esc(q.id) + "'>删除</button>" +
          "</div>" +
        "</div>";
      });
      $("quiz-list").innerHTML = html;
    } catch (e) {
      $("quiz-list").innerHTML = "<p class='muted'>读取题库失败</p>";
      console.error(e);
    }
  }

  async function onSetActive(id) {
    try {
      await window.SB.setActive(id);
      setMsg($("quiz-msg"), "已启用：" + id, "ok");
      await renderQuizList();
    } catch (e) {
      setMsg($("quiz-msg"), "切换失败", "err");
      console.error(e);
    }
  }

  async function onDelete(id) {
    if (!confirm("确定删除题库「" + id + "」？")) return;
    try {
      await window.SB.deleteQuiz(id);
      setMsg($("quiz-msg"), "已删除：" + id, "ok");
      await renderQuizList();
    } catch (e) {
      setMsg($("quiz-msg"), "删除失败", "err");
      console.error(e);
    }
  }

  async function onImport() {
    const raw = $("import-json").value.trim();
    if (!raw) { setMsg($("import-msg"), "请粘贴题库 JSON", "err"); return; }
    let q;
    try { q = JSON.parse(raw); }
    catch (e) { setMsg($("import-msg"), "JSON 格式错误：" + e.message, "err"); return; }
    if (!q.title || !Array.isArray(q.questions) || !q.questions.length) {
      setMsg($("import-msg"), "缺少 title 或非空 questions 数组", "err"); return;
    }
    setMsg($("import-msg"), "导入中…");
    try {
      const r = await window.SB.addQuiz(q);
      if (!r || r.ok === false) { setMsg($("import-msg"), (r && r.msg) || "导入失败", "err"); return; }
      const mode = r.quiz.resultMode;
      setMsg($("import-msg"), "导入成功：「" + r.quiz.title + "」（已自动识别为 " + mode + " 模式）", "ok");
      $("import-json").value = "";
      await renderQuizList();
    } catch (e) {
      setMsg($("import-msg"), "导入失败：" + e.message, "err");
      console.error(e);
    }
  }

  // ---------------- 访问码 ----------------
  async function gen() {
    const n = Math.min(500, Math.max(1, parseInt($("gen-count").value, 10) || 1));
    const note = $("gen-note").value.trim();
    // 主题同时可用：生成时把这批码绑定到所选测评（留空则跟随默认启用题）
    const quizId = $("gen-quiz") ? $("gen-quiz").value.trim() : "";
    setMsg($("dash-msg"), "生成中…");
    try {
      const r = await window.SB.adminGenerate(n, note, quizId);
      if (!r || r.ok === false) { setMsg($("dash-msg"), "生成失败，检查密钥", "err"); return; }
      const bound = quizId ? (QBYID[quizId] || quizId) : "默认测评";
      const cnt = r.codes ? r.codes.length : (r.count || n);
      setMsg($("dash-msg"), "已生成 " + cnt + " 个访问码，绑定测评：「" + bound + "」", "ok");
      await refresh();
    } catch (e) {
      setMsg($("dash-msg"), "生成失败", "err");
      console.error(e);
    }
  }

  async function refresh() {
    try {
      const r = await window.SB.adminList();
      if (!r || r.ok === false) { $("code-table").innerHTML = "<p class='muted'>读取失败</p>"; return; }
      const rows = Array.isArray(r) ? r : (r.rows || []);
      if (!rows.length) {
        $("code-table").innerHTML = window.SB.isTest
          ? "<p class='muted'>测试模式：点「生成」即可本地演示一批访问码（不写数据库）</p>"
          : "<p class='muted'>暂无访问码，先生成一个吧</p>";
        return;
      }
      let html = "<table><thead><tr><th>访问码</th><th>已用/总</th><th>绑定测评</th><th>备注</th><th>创建时间</th></tr></thead><tbody>";
      rows.forEach((x) => {
        const done = x.used >= x.max_uses;
        const qtitle = (x.quiz_id && QBYID[x.quiz_id]) || x.quiz_id || "默认";
        html += "<tr><td><b>" + x.code + "</b></td>" +
          "<td class='" + (done ? "used-no" : "used-ok") + "'>" + x.used + "/" + x.max_uses + "</td>" +
          "<td>" + esc(qtitle) + "</td>" +
          "<td>" + (x.note || "") + "</td>" +
          "<td>" + new Date(x.created_at).toLocaleString("zh-CN") + "</td></tr>";
      });
      html += "</tbody></table>";
      $("code-table").innerHTML = html;
    } catch (e) {
      $("code-table").innerHTML = "<p class='muted'>读取失败</p>";
      console.error(e);
    }
  }

  function logout() {
    sessionStorage.removeItem("mq_admin_key");
    show("login");
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function init() {
    $("btn-login").addEventListener("click", login);
    $("btn-gen").addEventListener("click", gen);
    $("btn-refresh").addEventListener("click", refresh);
    $("btn-logout").addEventListener("click", logout);
    $("btn-import").addEventListener("click", onImport);
    // 题库列表事件委托
    $("quiz-list").addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");
      if (action === "active") onSetActive(id);
      else if (action === "del") onDelete(id);
    });
    if (key) { C.adminKey = key; show("dash"); renderQuizList(); refresh(); }
    else show("login");
  }

  init();
})();
