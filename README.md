# 去马娘Only是什么感觉 · UmaFesSimulator
AIGC自主声明：readme是Deepseek写的，我写的没这么烂。

一个纯静态的网页文字冒险游戏：通过抽身份、备展、赶展、游场，体验一个小县城 coser
第一次去省城参加赛马娘 Only 的酸甜苦辣。

线上地址：<https://umao.daiwascarlet.vodka>
文案版权归 **爱丽数位装备社** 所有；网页代码由生成式人工智能技术辅助开发。

---

## 快速开始

游戏用的是原生 ES Module，**必须通过 HTTP 打开**（`file://` 下浏览器会拒绝加载模块）。
任选一种方式：

```bat
:: 用编辑器自带的静态服务（顺便就能改内容）
:: 注意：启动编辑器.bat 与 editor/ 都只在本地，不进仓库
双击 启动编辑器.bat        :: 或 node editor\headless.mjs
:: 然后访问 http://127.0.0.1:8760/game/index.html

:: 或者用任意静态服务器
npx serve .
python -m http.server 8080
```

旧浏览器（Symbian Belle / Android 4.0 / iOS 6 / IE 11 / Chrome 49 …）会自动走复古版
`Legacy/`，也可以用 `?legacy` 强制切换，`?native` 强制走原生版。

---

## 目录结构

```
index.html            三档浏览器路由：原生 / 复古 / 不支持提示页
styles.css            原生版样式
update_history.md     更新日志（运行时被界面读取）

content/          ★ 全部游戏内容（数据驱动，见下）
  manifest.json       项目清单：版本号、剧本列表、菜单入口、共用结局
  config.json         全局数值：身份模板、手机、痛车、酒店、交通、约妆、展会、彩蛋
  achievements.json   成就
  storyline.default.json   主线剧本（43 个节点 + 13 个结局）
  storyline.doujin.json    DLC「社团模式」

src/                  原生版（现代浏览器）
  game.js             入口：状态机调度、音频、存档、预览模式
  contentRuntime.js   ★ 数据驱动剧本运行时（解释 content/*.json）
  storyEngine.js      纯故事引擎内核（节点注册表 / 动作描述符协议）
  ui.js               全部视图渲染 + 辅助功能浮动菜单
  storage.js          存档、音效开关
  achievements.js     成就注册表
  theme.js            主题（默认 / 爱丽数码），用 canvas 平铺生成背景
  car.js              痛车数据库        umaNames.js  马娘名单
  storyData.js        跨剧本共享数据    utils.js     小工具

editor/          ★ 可视化编辑器（本地工具，不进仓库；见 editor/README.md）
  test/baseline/       改造前那两份 JS 剧本，只给一致性测试当对拍基线
Legacy/               复古版（ES5，独立自包含，由 rollup 打包）
lib/umalist.csv       马娘名单源数据
pic/ sound/           图片与音频资源
```

---

## 内容与代码是分开的

26.6.x 起，**所有剧本与数值都不再写在代码里**，而是放在 `content/*.json`。
浏览器启动时由 `src/contentRuntime.js` 读取并解释这些 JSON，注册进 `src/storyEngine.js`。

这样做的直接好处：**不懂代码也能改内容**——用编辑器改，或者直接改 JSON。

- 内容格式规范：`editor/docs/CONTENT-SCHEMA.md`
- 编辑器使用说明：`editor/README.md`

### 改内容有两种方式

**① 用可视化编辑器（推荐，不需要懂代码）**

双击项目根的 `启动编辑器.bat`。可以改节点文案、选项、条件、结局、成就、数值表，
有流程图、真实游戏预览、内容校验，保存前自动备份。

**② 直接改 JSON**

`content/*.json` 都是普通 JSON。改完刷新页面即可，没有构建步骤。

> ⚠️ 部署时**必须把 `content/` 一起上传**，否则游戏会因为拉不到内容而启动失败。

### 编辑器改不了的部分

`contentRuntime.js` 提供的是一套声明式的规则语言（条件 / 效果 / 变体 / 加权随机 / 骰子），
能表达现有全部玩法。极少数东西仍需写代码：

- 全新的效果类型（要在 `src/contentRuntime.js` 的 `runSteps` 里加一个分支）；
- 全新的界面形态（要在 `src/ui.js` 里加渲染）；
- `Legacy/` 复古版（它是独立自包含的 ES5 副本，不读 `content/`）。

---

## 测试

```bat
:: 内容运行时冒烟测试（不需要浏览器）
node editor\test\smoke-runtime.mjs

:: 编辑器后端 API 测试（真的起服务、真的写临时项目、测完自动清理）
node editor\test\smoke-editor-api.mjs

:: 一致性回归测试：把「内容 JSON」和「改造前的 JS 剧本」对拍
::   结构清单 / 结局文案 / 静态节点文本 / 随机通关的结局与访问分布
node editor\test\conformance.mjs --runs 8000
```

`conformance.mjs` 是内容层最重要的安全网：它把「改造前的 JS 剧本」和「现在的 `content/*.json`」逐项对拍，
证明这次迁移是一次**纯重构**——改动内容之前先跑一遍，改动之后再跑一遍，就能知道有没有把玩法改坏。

改造前的两份 JS 剧本（`storyline_default.js` / `storyline_doujin.js`）已经**不在仓库里**了，
挪到了 `editor/test/baseline/`，只给 `conformance.mjs` 当对拍基线用（`editor/` 不随仓库分发）。
`src/storyData.js` 还在，但只剩 `UMA_BIRTHDAYS` 和两个跨剧本预告结局——它们被 `src/game.js` 直接引用。

---

## 复古版（Legacy）

`Legacy/` 是给老浏览器用的独立 ES5 版本，**不读 `content/`**，内容单独维护。
重新打包：

```bat
npm run build:legacy      :: rollup -c legacy.config.mjs
```

---

## 许可证

见 [LICENSE](LICENSE)。
