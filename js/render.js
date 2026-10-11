/* 结果卡片渲染：level（按总分分级）/ type（取最高维度）两种模式共用，
 * 主站结果页与分享只读页都调用它，保证两处显示完全一致。
 */
(function () {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  window.RenderResult = function (cardEl, res, store) {
    var html = "";

    // 头部：标题 + 结果标签（胶囊）
    html += '<div class="result-head">';
    html += '<div class="result-title">' + esc(res.title);
    if (res.total != null) html += " · 得分 " + esc(res.total);
    html += "</div>";
    html += '<div class="result-label">' + esc(res.label) + "</div>";
    html += "</div>";

    // 结果分析
    html += '<div class="result-analysis">' + esc(res.analysis) + "</div>";

    // type 模式：维度得分条（与主站/分享页都一致的「不同显示」）
    if (res.kind === "type" && res.dims && res.dims.length) {
      var max = Math.max.apply(null, res.dims.map(function (d) { return d.score; }).concat([1]));
      html += '<div class="result-dims">';
      res.dims.forEach(function (d) {
        var pct = Math.round((d.score / max) * 100);
        html += '<div class="dim-row">' +
          '<span class="dim-name">' + esc(d.label) + "</span>" +
          '<span class="dim-bar"><i style="width:' + pct + '%"></i></span>' +
          '<span class="dim-val">' + esc(d.score) + "</span>" +
          "</div>";
      });
      html += "</div>";
    }

    // 标签（type 模式的特征词）
    if (res.traits && res.traits.length) {
      html += '<div class="result-traits">' +
        res.traits.map(function (t) { return '<span class="trait">' + esc(t) + "</span>"; }).join("") +
        "</div>";
    }

    // 店铺信息（未填写真实店铺名时不显示，避免出现占位文字）
    var hasStore = store && store.name && store.name !== "你的店铺名";
    if (hasStore) {
      html += '<div class="result-foot">' +
        '<div class="store-name">🛒 ' + esc(store.name) + "</div>" +
        '<div class="store-tip">搜索店铺名，购买更多趣味测评 🔍</div>' +
        "</div>";
    }

    cardEl.innerHTML = html;
  };
})();
