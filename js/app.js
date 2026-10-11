/* 主流程：密码门 → 答题（可返回）→ 结果 → 存图/分享/再测/好评 */
(function () {
  const C = window.CONFIG;
  let Q = null; // 当前启用的题库（多题库下由后台切换；init 时加载）
  const store = C.store;
  const $ = (id) => document.getElementById(id);

  // ---------- 状态 ----------
  const S = {
    code: sessionStorage.getItem("mq_code") || "",
    answers: JSON.parse(sessionStorage.getItem("mq_answers") || "[]"),
    index: parseInt(sessionStorage.getItem("mq_index") || "0", 10),
    remaining: parseInt(sessionStorage.getItem("mq_remaining") || "0", 10),
    result: sessionStorage.getItem("mq_result")
      ? JSON.parse(sessionStorage.getItem("mq_result"))
      : null
  };

  function saveSession() {
    sessionStorage.setItem("mq_code", S.code);
    sessionStorage.setItem("mq_answers", JSON.stringify(S.answers));
    sessionStorage.setItem("mq_index", String(S.index));
    sessionStorage.setItem("mq_remaining", String(S.remaining));
    if (S.result) sessionStorage.setItem("mq_result", JSON.stringify(S.result));
    else sessionStorage.removeItem("mq_result");
  }

  function show(screenId) {
    ["screen-gate", "screen-quiz", "screen-result"].forEach((id) =>
      $(id).classList.toggle("hidden", id !== screenId)
    );
  }

  // 确定性固定尺寸：完全由题目文本长度算出，不依赖隐藏探针 / 字体加载时机。
  // 以「文字最多的那道题」为基准，把 10 道题的题干高度、选项高度、整卡高度
  // 全部钉死，文字再多也绝不伸缩。
  function charUnits(s) {
    let u = 0;
    for (const ch of s) {
      const c = ch.codePointAt(0);
      // 汉字 / 全角 / 中文标点按 1 个单位；字母数字半角按 0.5
      if (c >= 0x2e80 && c <= 0x9fff) u += 1;        // CJK 汉字 / 部首
      else if (c >= 0xff00 && c <= 0xffef) u += 1;    // 全角字符
      else if (c >= 0x3000 && c <= 0x303f) u += 1;    // 中文标点
      else u += 0.5;
    }
    return u;
  }

  function computeSizes() {
    const root = document.documentElement;
    const appW = Math.min(window.innerWidth || 375, 520);
    const cardContent = appW - 16 * 2 - 20 * 2; // app 内边距(16*2) + 卡片内边距(20*2)

    // —— 选项：2 列网格，取最高那张的固定高度 ——
    const optWidth = (cardContent - 10) / 2;          // 2 列，列间距 10
    const optUsable = optWidth - 14 * 2;              // 选项左右内边距各 14
    const perLineOpt = Math.max(1, Math.floor(optUsable / (15 * 0.95)));
    let maxOptH = 0;
    Q.questions.forEach((q) =>
      q.options.forEach((o) => {
        const lines = Math.max(1, Math.ceil(charUnits(o.text) / perLineOpt));
        const h = Math.ceil(lines * 15 * 1.45 + 14 * 2 + 6); // 行高 + 内边距 + 安全余量
        maxOptH = Math.max(maxOptH, h);
      })
    );

    // —— 题干：取最长那道固定高度 ——
    const perLineQ = Math.max(1, Math.floor(cardContent / (19 * 0.95)));
    let maxQH = 0;
    Q.questions.forEach((q) => {
      const lines = Math.max(1, Math.ceil(charUnits(q.q) / perLineQ));
      const h = Math.ceil(lines * 19 * 1.6 + 6);
      maxQH = Math.max(maxQH, h);
    });

    // —— 整张答题卡片固定高度 ——
    const cardH =
      21 +                                   // 进度文字
      24 +                                   // 进度条
      (maxQH + 18) +                         // 题干 + 下边距
      (maxOptH * 2 + 10) +                   // 两行选项 + 间距
      32 +                                   // 提示语
      64 +                                   // 上一题 / 下一题 按钮
      44;                                    // 卡片内边距 22*2

    root.style.setProperty("--opt-h", maxOptH + "px");
    root.style.setProperty("--q-h", maxQH + "px");
    root.style.setProperty("--quiz-h", cardH + "px");
  }

  function setMsg(el, text, type) {
    el.textContent = text || "";
    el.className = "msg" + (type ? " " + type : "");
  }

  // ---------- 初始化 ----------
  async function init() {
    // 多题库：先取「默认启用题」作为密码门的展示/兜底；
    // 用户实际测哪一套，由所输访问码绑定的 quiz_id 决定（见 loadQuizByCode）
    Q = await window.SB.getActiveQuiz();
    if (!Q || !Q.questions) {
      $("screen-gate").innerHTML = '<div class="card center"><h1 class="big-title">暂无题库</h1><p class="muted">请到后台添加或启用一套测评。</p></div>';
      return;
    }
    document.title = Q.title;
    $("gate-title").textContent = Q.title;
    $("gate-intro").textContent = Q.intro || "";
    $("q-total").textContent = Q.questions.length;
    computeSizes();
    let _rt;
    window.addEventListener("resize", () => { clearTimeout(_rt); _rt = setTimeout(computeSizes, 150); });
    if (window.SB && window.SB.isTest) {
      $("gate-test").textContent = "测试模式：可用访问码 " + C.testCode + "（无需配置后端）";
      $("gate-test").classList.remove("hidden");
    }
    // 店铺信息：结果卡片由 render.js 动态生成（含 #res-store），
    // 此处仅在元素已存在时设置，避免 init 因找不到元素而中断、导致按钮无法绑定。
    const rse = $("res-store");
    if (rse) rse.textContent = "🛒 " + C.store.name;
    $("review-text").textContent =
      "店铺：" + C.store.name + "\n" + C.store.contact + "\n\n" + C.store.cashback;

    $("btn-start").addEventListener("click", onStart);
    $("btn-prev").addEventListener("click", onPrev);
    $("btn-next").addEventListener("click", onNext);
    $("btn-save-img").addEventListener("click", onSaveImg);
    $("btn-copy-link").addEventListener("click", onCopyLink);
    $("btn-retest").addEventListener("click", onRetest);
    $("btn-review").addEventListener("click", () => $("review-modal").classList.remove("hidden"));
    $("btn-review-close").addEventListener("click", () => $("review-modal").classList.add("hidden"));

    // 恢复会话
    if (S.code && S.result) { renderResult(S.result); show("screen-result"); }
    else if (S.code) { renderQuestion(); show("screen-quiz"); }
    else show("screen-gate");
  }

  // ---------- 密码门 ----------
  // 主题同时可用：按访问码绑定的 quiz_id 加载对应测评。
  // 不同码可绑不同题库，多套测评同时在线、互不干扰。
  // 若码未绑定（quizId 为空）则沿用默认启用题。
  async function loadQuizByCode(quizId) {
    if (quizId) {
      const qz = await window.SB.getQuizById(quizId);
      if (qz && qz.questions && qz.questions.length) {
        Q = qz;
        document.title = Q.title;
        computeSizes();  // 换题库后重算固定尺寸，保证卡片一致
        return;
      }
    }
    // 兜底：默认启用题
    const def = await window.SB.getActiveQuiz();
    if (def && def.questions) { Q = def; document.title = Q.title; computeSizes(); }
  }

  async function onStart() {
    const code = $("code-input").value.trim();
    if (!code) { setMsg($("gate-msg"), "请输入访问码", "err"); return; }
    setMsg($("gate-msg"), "校验中…");
    try {
      const r = await window.SB.validateCode(code);
      if (!r.ok) {
        setMsg($("gate-msg"), r.reason === "used_up" ? "该访问码次数已用完" : "访问码无效", "err");
        return;
      }
      S.code = code;
      S.remaining = r.remaining;
      S.answers = []; S.index = 0; S.result = null;
      await loadQuizByCode(r.quiz_id || r.quizId);
      saveSession();
      renderQuestion();
      show("screen-quiz");
    } catch (e) {
      setMsg($("gate-msg"), "网络错误，请重试", "err");
      console.error(e);
    }
  }

  // ---------- 答题 ----------
  function renderQuestion() {
    const q = Q.questions[S.index];
    $("q-index").textContent = S.index + 1;
    $("q-total").textContent = Q.questions.length;
    $("q-text").textContent = q.q;
    const pct = ((S.index) / Q.questions.length) * 100;
    $("progress-fill").style.width = pct + "%";
    $("btn-prev").disabled = S.index === 0;
    $("btn-next").textContent = S.index === Q.questions.length - 1 ? "查看结果" : "下一题";

    const wrap = $("options");
    wrap.innerHTML = "";
    q.options.forEach((opt, i) => {
      const div = document.createElement("div");
      div.className = "option" + (S.answers[S.index] === i ? " selected" : "");
      div.textContent = opt.text;
      div.addEventListener("click", () => {
        S.answers[S.index] = i;
        [...wrap.children].forEach((c, ci) => c.classList.toggle("selected", ci === i));
        saveSession();
      });
      wrap.appendChild(div);
    });
  }

  function onPrev() {
    if (S.index > 0) { S.index--; saveSession(); renderQuestion(); }
  }

  function onNext() {
    if (S.answers[S.index] === undefined) {
      setMsg($("quiz-msg"), "请先选择一个选项", "err");
      return;
    }
    setMsg($("quiz-msg"), "");
    if (S.index < Q.questions.length - 1) {
      S.index++; saveSession(); renderQuestion();
    } else {
      computeAndShow();
    }
  }

  // ---------- 算分 / 结果 ----------
  // 支持两种模式：
  //   level：累加每题 score，按总分落入 levels 分级
  //   type ：累加每题 scores 的维度分值，取最高维度对应的 type
  function computeResult() {
    if (Q.resultMode === "type") {
      const dims = {};
      Q.questions.forEach((q, qi) => {
        const sc = (q.options[S.answers[qi]] || {}).scores || {};
        for (const k in sc) dims[k] = (dims[k] || 0) + sc[k];
      });
      let topKey = null, topVal = -1;
      for (const k in dims) { if (dims[k] > topVal) { topVal = dims[k]; topKey = k; } }
      const t = (Q.types || []).find((x) => x.key === topKey) || { label: topKey, analysis: "", traits: [] };
      const dimArr = (Q.types || [])
        .map((x) => ({ key: x.key, label: x.label, score: dims[x.key] || 0 }))
        .sort((a, b) => b.score - a.score);
      return { kind: "type", quizId: Q.id, title: Q.title, label: t.label, analysis: t.analysis, traits: t.traits || [], dims: dimArr };
    }
    // 默认 level 模式
    let total = 0;
    Q.questions.forEach((q, qi) => { total += (q.options[S.answers[qi]].score || 0); });
    let level = Q.levels[Q.levels.length - 1];
    for (const lv of Q.levels) { if (total >= lv.min) level = lv; }
    return { kind: "level", quizId: Q.id, title: Q.title, label: level.label, analysis: level.analysis, total };
  }

  function computeAndShow() {
    const res = computeResult();
    S.result = res;
    saveSession();
    renderResult(res);
    show("screen-result");
    setMsg($("result-msg"), "");
  }

  function renderResult(res) {
    window.RenderResult($("result-card"), res, C.store);
    // 剩余次数为 0 时禁用再测
    $("btn-retest").disabled = S.remaining <= 0;
  }

  // ---------- 保存长图 ----------
  async function onSaveImg() {
    const card = $("result-card");
    try {
      const canvas = await html2canvas(card, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
      const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
      const url = URL.createObjectURL(blob);
      const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
      if (isIOS) {
        window.open(url, "_blank");
        setMsg($("result-msg"), "图片已打开，长按即可保存到相册", "ok");
      } else {
        const a = document.createElement("a");
        a.href = url; a.download = "测评结果.png";
        document.body.appendChild(a); a.click(); a.remove();
        setMsg($("result-msg"), "已保存为图片，如未自动保存请右键/长按图片保存", "ok");
      }
    } catch (e) {
      setMsg($("result-msg"), "生成图片失败，请重试", "err");
      console.error(e);
    }
  }

  // ---------- 复制结果链接 ----------
  async function onCopyLink() {
    try {
      const r = await window.SB.createResult(S.result);
      const token = r.token;
      const shareUrl = new URL("result.html", location.href).href + "?r=" + token;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setMsg($("result-msg"), "结果链接已复制，去分享吧～", "ok");
      } else {
        setMsg($("result-msg"), "复制失败，链接：" + shareUrl);
      }
    } catch (e) {
      setMsg($("result-msg"), "生成链接失败，请重试", "err");
      console.error(e);
    }
  }

  // ---------- 再测一次 ----------
  async function onRetest() {
    if (S.remaining <= 0) { setMsg($("result-msg"), "访问码次数已用完", "err"); return; }
    setMsg($("result-msg"), "校验中…");
    try {
      const r = await window.SB.validateCode(S.code);
      if (!r.ok) { setMsg($("result-msg"), "访问码次数已用完", "err"); return; }
      S.remaining = r.remaining;
      S.answers = []; S.index = 0; S.result = null;
      await loadQuizByCode(r.quiz_id || r.quizId);
      saveSession();
      renderQuestion();
      show("screen-quiz");
    } catch (e) {
      setMsg($("result-msg"), "网络错误，请重试", "err");
      console.error(e);
    }
  }

  init().catch(function (e) { console.error(e); });
})();
