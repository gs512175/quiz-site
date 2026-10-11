/*
 * ============================================================
 *  测评网站配置文件  —  只放「连接 / 店铺 / 默认启用」三类
 * ============================================================
 *  题库内容（多套测评）已挪到独立文件  js/quizzes.js  （window.QUIZZES）。
 *  换主题 / 加题库改那里即可，本文件尽量不动。
 * ============================================================
 */
window.CONFIG = {
  // ===== 本地测试模式 =====
  // false = 正式模式（连 Supabase）；true = 本地演示（不连数据库）
  testMode: false,
  testCode: "TEST2026", // 仅 testMode=true 时有效

  // ===== Supabase 连接 =====
  supabaseUrl: "https://vonimlqbbecgxsykjdgt.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbmltbHFiYmVjZ3hzeWtqZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2OTg1OTksImV4cCI6MjEwNzI3NDU5OX0.KnnDppt_ikPM33MtMPa4hZtFb_B4HUQQqj05rgG9IfI",

  // ===== 后台管理员密钥（★故意留空，不要填） =====
  // 原因：本仓库要推到公开的 GitHub Pages，密钥写进文件等于公开，
  //       任何人都能进后台批量生成访问码（等于白送）。
  // 用法：打开 admin.html，在登录框手动输入密钥即可（同一标签页会记住）。
  // 改密钥：在 Supabase SQL Editor 执行
  //   update app_config set value = '新密钥' where key = 'admin_key';
  adminKey: "",

  // ===== 店铺信息（用于结果页底部 + 好评有礼弹窗）=====
  // ★这两处请改成你自己的（还没填）
  store: {
    name: "你的店铺名",
    contact: "客服微信：your_wechat",
    cashback: "在店铺完成好评后，截图发给客服，即可领取 1 元返现～"
  },

  // ===== 默认启用的测评（后台可切换） =====
  defaultActiveId: "banwei"
};
