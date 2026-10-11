/*
 * ============================================================
 *  测评网站配置文件  —  只放「连接 / 店铺 / 默认启用」三类
 * ============================================================
 *  题库内容（多套测评）已挪到独立文件  js/quizzes.js  （window.QUIZZES）。
 *  换主题 / 加题库改那里即可，本文件尽量不动。
 * ============================================================
 */
window.CONFIG = {
  // ===== 本地测试模式（上线前改为 false） =====
  // 开启后无需配置 Supabase，用下方 testCode 即可走通全流程，
  // 访问码用量、题库、分享结果都存在浏览器本地，方便先体验界面与交互。
  testMode: true,
  testCode: "TEST2026",

  // ===== Supabase 连接（必填，testMode=false 时生效） =====
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR-ANON-KEY",

  // ===== 后台管理员密钥（必填，需与 Supabase 的 app.admin_key 一致） =====
  adminKey: "CHANGE_ME_ADMIN_KEY",

  // ===== 店铺信息（用于好评有礼） =====
  store: {
    name: "你的店铺名",
    contact: "客服微信：your_wechat",
    cashback: "在店铺完成好评后，截图发给客服，即可领取 1 元返现～"
  },

  // ===== 默认启用的测评（后台可切换；用户端永远只测当前启用的这一套） =====
  // 对应 js/quizzes.js 里某套题库的 id
  defaultActiveId: "banwei"
};
