// Static data shared across all storylines.
// Storyline-specific data (PHONE_MODELS, templates, endings, etc.)
// now lives in each storyline module (e.g. storyline_default.js).

import { UMA_NAMES, UMA_BIRTHDAYS } from "./umaNames.js";
export { UMA_BIRTHDAYS };

export const GAME_VERSION = "26.6.15";

// Cosplay pool: sourced from lib/umalist.csv via umaNames.js.
export const COSPLAY_POOL = UMA_NAMES;

// ── Cross-storyline endings (预告 / 跨作品) ──────────────
export const COMMON_ENDINGS = {
  waitForUpdate: {
    name: "新模式预告：社团模式",
    text:
      "在经过本次更新之后，我们通过解耦原有的剧情功能，使得加入新的剧本成为可能。\n与此同时，基于以上的技术改进，我们将在不远的将来，提供全新DLC“社团模式”，\n在这一全新的模式中，你可以扮演社团主催，通过完善你的同人创作，制定相应的宣发策略，使得你的创作在马娘Only上大放异彩！\n敬请期待后续更新，感谢您的支持！",
  },
  ArknightsGameHeatup: {
    name: "新游戏预告：罗德岛后勤干员入职考核",
    text:
      "在经过本次更新之后，我们通过解耦原有的剧情和数据功能，使得该游戏成为一个通用的文字游戏平台。\n借助以上的技术结晶，我们将依托这一全新平台，构建基于明日方舟世界观的同人游戏“罗德岛后勤干员入职考核”。\n新游戏中，你将扮演一个罗德岛收治的病人，由于无力支付医疗费用不得不参与后勤干员的招募计划。游戏中您将通过完成日常工作与干员特殊任务，逐渐提升认可程度，并在最终的入职考核环节取得理想成绩。\n是成为罗德岛的一份子？还是成为一颗罗德岛低容电池？一切掌握在您的手中。\n敬请期待！",
  },
};
