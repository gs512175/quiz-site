# 可售卖测评网站

一个**免构建**的测评网站，配套 Supabase 后端，支持**多套测评题库**与后台管理。支持「访问码」开门（每码 3 次）、逐题作答（可返回上一题）、结果长图保存、结果链接分享、再测一次、好评有礼，全移动端适配。题库内容在 `js/quizzes.js`（已内置 10 套示例），连接/店铺/默认启用在 `js/config.js`。

## 目录结构
```
index.html        主流程：密码门 → 答题 → 结果
admin.html        管理后台：生成访问码、查看用量
result.html       分享只读结果页（?r=token）
css/style.css
js/config.js      ★ 配置（连接 / 店铺 / 默认启用，必改）
js/quizzes.js      ★ 题库集合（10 套示例 + 可增删）
js/supabase.js    Supabase 封装（含题库 CRUD）
js/app.js         主流程逻辑
js/admin.js       后台逻辑（题库管理 + 访问码）
js/render.js      结果卡片渲染（level/type 共用）
js/result-view.js 分享页逻辑
supabase/schema.sql  数据库建表 + RPC（含 quizzes 表）
lib/              可选：把 CDN 依赖下载到这里做离线部署
```

## 当前环境（已配置好，勿重复填）
| 项 | 值 |
|---|---|
| Supabase Project URL | `https://vonimlqbbecgxsykjdgt.supabase.co` |
| anon public key | 已写入 `js/config.js`（anon key 本就是公开的，放仓库没问题） |
| `testMode` | `false`（正式模式，连真实数据库） |
| 管理员密钥 | **未写入仓库**（防泄露），进 `admin.html` 时手动输入 |
| ★还差 | `js/config.js` 里的 `store.name`（店铺名）和 `store.contact`（客服微信）——目前还是占位符 |

## 快速开始（3 步）

### 1. 建 Supabase 数据库
1. 打开 https://supabase.com 新建项目（地区建议选 Singapore / Tokyo，国内访问更快）。
2. 控制台 → SQL Editor → 新建查询 → 粘贴 `supabase/schema.sql` 全部内容 → Run。
3. **再执行一次 `supabase/seed.sql`**（把 10 套题库灌进 `quizzes` 表）。
   > ⚠️ 漏了这步，上线后用户会看到「暂无题库」——因为真实模式的题库来自数据库，不是前端文件。
4. 设置管理员密钥（密钥存在 `app_config` 表，不用数据库参数）：
   ```sql
   update app_config set value = '你的密钥' where key = 'admin_key';
   ```
   > ⚠️ 别用 `alter database ... set app.admin_key`——Supabase 的 SQL Editor 角色没有该权限，会整段报错。

### 2. 填配置 `js/config.js`
```js
supabaseUrl:    "https://xxxx.supabase.co",   // Project → Data API → Project URL
supabaseAnonKey:"eyJ...",                      // Project → API Keys → Legacy → anon public
adminKey:       "",                            // ★保持空！见下方说明
store: { name, contact, cashback },             // 店铺信息（好评有礼弹窗用）
defaultActiveId:"banwei"                        // 默认启用的题库 id（对应 quizzes.js 里的某套）
```
> **为什么 `adminKey` 故意留空**：站点要推到公开的 GitHub Pages，密钥写进文件等于公开，任何人都能进后台批量生成访问码（等于白送）。
> 正确用法：打开 `admin.html`，在登录框**手动输入密钥**（同一标签页会记住），密钥只存在浏览器会话里。
> 题库内容（题目/结果）全部在 `js/quizzes.js`，改主题或加题库改那里，不用动本文件。

### 3. 部署
- **GitHub Pages**：把整个文件夹推到仓库，Settings → Pages → 选分支根目录。
- **任意静态托管**：直接上传所有文件即可。

## 后台（题库管理 + 卖码）
访问 `admin.html` → 输入管理员密钥（测试模式任意字符）即可进入。后台两块：

**① 题库管理**
- 列出全部题库，标注「已启用」的那一套就是用户端当前测的。
- 「启用」按钮：设为**默认测评**——未绑定测评的访问码（含测试码 `TEST2026`）都测这一套；已绑定某套的码不受影响。
- 「删除」按钮：删掉某套（内置 10 套为标记删除，可重新导入恢复）。
- **导入新题库**：在文本框粘贴一套测评的 JSON，系统**自动识别 level / type 模式**（看你选项用的是 `score` 还是 `scores`），无需手选。

JSON 格式（可省略 `resultMode`，让系统自动识别）：
```json
{
  "id": "myquiz",
  "title": "我的测评",
  "intro": "一句话介绍",
  "questions": [
    { "q": "问题？", "options": [ { "text": "选项A", "score": 3 }, { "text": "选项B", "score": 0 } ] }
  ],
  "levels": [ { "min": 0, "label": "档1", "analysis": "分析…" } ]
}
```
> 用 `type` 模式时，选项改为 `scores:{"A":3,"B":0}`，并提供 `types` 数组（含 `key/label/analysis/traits`）。

**② 访问码管理（支持绑定测评 → 多主题同时在线）**
选择「绑定测评」→ 输入数量 + 备注 → 生成 → 复制码发给买家。
- 每个码生成时就**绑定某套题库**，买家输该码只会测绑定的那一套。
- 留空选「默认测评」= 跟随后台当前「已启用」的题库。
- 列表显示每个码的「已用/总」次数和**所绑定的测评**。

## 多题库 / 主题同时可用
有两种玩法，可混用：

| 玩法 | 做法 | 效果 |
|------|------|------|
| **全局切换** | 后台对某套点「启用」 | 未绑定测评的码（含测试码）都测这一套 |
| **每码绑定**（推荐，多主题同时在线） | 生成码时选好绑定哪套 | **不同码测不同测评，全部同时在线，互不干扰** |

- 买家买 A 题的码 → 测 A；买 B 题的码 → 测 B。切后台「启用」不会影响已绑定的码。
- **用户端不能选题**：测哪套完全由码决定（或跟随默认启用题），用户只管输码。
- **改题目 / 加题型**：编辑 `js/quizzes.js` 的对应题库；新增整套也可在后台「导入 JSON」。

### 切换主题后，原来的测试还在吗？
**都在，且不会失效。**
- **题库本身不会被删**：切换只是改 `is_active` 标记，10 套内容都保留（后台「删除」内置库也只是打标记，重新导入即可恢复）。
- **已完成的测试结果也保留**：结果记录是**自带数据**的（标题、等级、分析、维度、`quizId` 全部存进记录）。分享链接 `?r=token` 打开时直接用这份数据渲染，**不依赖当前启用哪一套**，所以切换主题后旧结果页和分享链接照样能看。

`resultMode` 决定结果页样式，两种模式结果页不同：

| 模式 | 含义 | 结果页显示 | 需要的配置 |
|------|------|-----------|-----------|
| `"level"` | 按总分分级 | 得分 + 等级标签 + 分析 | `levels` 数组；每题选项 `score:数字` |
| `"type"`  | 取最高维度 | 类型标签 + 分析 + 维度得分条 + 特征标签 | `types` 数组；每题选项 `scores:{维度key:分值}` |

题目格式：
```js
// level 模式
{ id:1, q:"问题？", options:[ { text:"选项", score:3 } ] }
// type 模式
{ id:1, q:"问题？", options:[ { text:"选项", scores:{A:3,B:0,C:0,D:0} } ] }
```

## 依赖说明
`supabase-js` 与 `html2canvas` **已下载到 `lib/` 并本地引用**（自包含）。不依赖任何外部 CDN，国内访问稳定、也不会因第三方 CDN 故障而失效。
- 如需升级版本，替换 `lib/` 下两个文件即可。
- 若想改回 CDN，把各 HTML 里 `lib/xxx.min.js` 换回对应的 `<script src="https://...">` 即可。

## 部署到 GitHub Pages
1. 在 [github.com](https://github.com) 新建仓库（如 `quiz-site`），**不要**勾选初始化 README。
2. 本机进入项目目录，用 `gh` 一键推送（需先 `gh auth login` 登录一次）：
   ```bash
   gh repo create quiz-site --public --source=. --push
   ```
   > 不用 `gh` 也可：`git remote add origin https://github.com/<用户名>/quiz-site.git && git push -u origin main`
3. 仓库页面 → **Settings → Pages** → Source 选 `main` 分支、目录选 `/ (root)` → Save。
4. 等 1–2 分钟，访问 `https://<用户名>.github.io/quiz-site/` 即可。

> 仓库已含 `.nojekyll`，避免 GitHub 用 Jekyll 二次处理页面。

## 常见问题
- **提示「请填写 supabaseUrl」**：先在 `config.js` 填好连接信息。
- **分享链接打不开**：确认 `result.html` 与 `index.html` 在同一目录，且网络可访问 Supabase。
- **访问码次数不对**：每点一次「开始测评 / 再测一次」消耗 1 次，共 3 次。
