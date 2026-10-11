/* 分享只读结果页：?r=token —— 与主站共用 RenderResult，显示完全一致 */
(function () {
  const C = window.CONFIG;
  const $ = (id) => document.getElementById(id);

  function getToken() {
    return new URLSearchParams(location.search).get("r");
  }

  function setMsg(t) {
    $("result-msg").textContent = t;
    $("result-msg").className = "msg err";
  }

  async function main() {
    const token = getToken();
    if (!token) { setMsg("链接缺少结果参数"); return; }
    try {
      const res = await window.SB.getResult(token);
      if (!res || (typeof res === "object" && res.ok === false)) {
        setMsg("结果不存在或已失效"); return;
      }
      window.RenderResult($("result-card"), res, C.store);
    } catch (e) {
      setMsg("加载失败，请重试"); console.error(e);
    }
  }

  main();
})();
