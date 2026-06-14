// ── Story Nodes Registry ──────────────────────────────────
// Every story node in the game is defined here as a pure factory function.
// Import this module and call registerAllNodes() to populate the engine.

import {
  registerNode,
  registerEndings,
  registerAudioHook,
  registerAchievementHook,
  applyEffects,
  checkAfford,
  clamp01to100,
} from "./storyEngine.js";

import {
  COSPLAY_POOL,
  COMMON_ENDINGS,
} from "./storyData.js";

import {
  CAR_MODELS,
  getCarLabel,
  PAIN_CAR_MODELS_UNIVERSITY,
  PAIN_CAR_MODELS_OFFICE,
} from "./car.js";
import { UMA_NAMES } from "./umaNames.js";
import { clamp, formatTimeHHMM, randInt, weightedPick } from "./utils.js";

// ══════════════════════════════════════════════════════════
//  Default Storyline Data
// ══════════════════════════════════════════════════════════

export const PHONE_MODELS = [
  { id: "GooglePixel6Pro", label: "Google Pixel 6 Pro", weight: 5, template: "高中生" },
  { id: "IPhoneSE2", label: "iPhone SE2", weight: 9, template: "高中生" },
  { id: "RedmiNote11", label: "Redmi Note 11", weight: 90, template: "高中生" },

  { id: "GooglePixel7a", label: "Google Pixel 7a", weight: 5, template: "大学生" },
  { id: "IPhone15Plus", label: "iPhone 15 Plus", weight: 39, template: "大学生" },
  { id: "RedmiK70Pro", label: "Redmi K70 Pro", weight: 60, template: "大学生" },

  { id: "GooglePixel10ProXL", label: "Google Pixel 10 Pro XL", weight: 5, template: "社畜" },
  { id: "IPhone17ProMax", label: "iPhone 17 Pro Max", weight: 49, template: "社畜" },
  { id: "OPPOFindX8Ultra", label: "OPPO Find X8 Ultra", weight: 50, template: "社畜" },
];

export const HIGH_SCHOOL_TEMPLATE = "high_school";
export const COLLEGE_TEMPLATE = "college";
export const OFFICE_TEMPLATE = "office";

export const COSPLAY_TEMPLATE_ORDER = "cos_clothes_then_phone_then_pain_car_then_pain_style";

// 标准模式结局存储库 ────────────────────────────
export const DEFAULT_ENDINGS = {
  neverStartDream: {
    name: "从未开始的梦",
    text:
      "你因为各种各样的原因和考虑，最终放弃了参与省城马娘Only。\n你很无奈，但没办法，只好在展会当天在群里复读「去马O，究竟是什么感觉」。",
  },
  hopeMature: {
    name: "希望我能变得更成熟一些",
    text:
      "你的家长在不知道什么时候，看到了你的手机。\n虽然你已经成年，而且刚刚高中毕业，但你的家长依旧十分生气，觉得你不听话。\n“暑假这么长时间，不去打工，不去预习大学课程，非得和那些网上的狐朋狗友出去玩，他们什么学历你什么学历？你都这么大人了还和这些烂人玩，不好好爱惜羽毛。我们都是为你好，到时候你被这些不三不四，男扮女装的切了，都给他们数钱！”\n计划去省城的漫展，被家长抓了。如果你成绩再好一些，如果你再勇敢一些，可能马上就能去省城马娘Only了。\n感情等方面也如此。得不到的，与其坚持，不如转移目标。这期间可能会遇到更好的，但也有可能更配不上。或许努力一些就能得到更好的，又或许向现实妥协，选择凑合下去。\n希望以后你能变得更成熟一些。",
  },
  loveYourself: {
    name: "要好好爱自己",
    text:
      "经过舟车劳顿，你还是不堪重负，倒下了。\n有人发现了你，把你送往最近的医院。\n回到家之后，你发现好多群友都在关心那个在马O路上晕倒的人怎么样了，你感受到了世界的善意。\n虽然如此，但是身体最重要，先好好爱自己，再去追求其他的热爱吧。",
  },
  workWhy: {
    name: "人为什么要上班",
    text:
      "你的老板突然打来了电话，虽然你知道今天是休息日。\n“喂？你现在人在哪？打你好几个电话怎么都没接？现在客户要来审核，好几个文档都没有齐套，现在马上上会，把SMT、测试、硬件、组装领域的人都拉上来，把文档都对清楚了，别搞客诉！”\n你在漫展上打开笔记本电脑干活的样子，像个异类。你不知道这种日子什么时候才是个头。\n不断地内卷已经击垮了你对美好事物的一切向往，你甚至感到了一种无助。\n于是你回到公司的第二天，就提了离职，希望下一家公司能对你好一些。",
  },
  selfDefense: {
    name: "正当防卫",
    text:
      "经过一整天的调解，对方受到了来自警方的批评教育。\n与此同时一段视频在互联网上疯狂传播，是对方恼羞成怒之后试图扒掉你的衣服，你将他控制在地上。\n评论区意外的一致，都是“有这样的力量，哪怕穿着裙子，那也是最男人的男人”。\n你有些欣慰。",
  },
  braveGirl: {
    name: "勇敢的女孩子",
    text:
      "经过一整天的调查，对方受到了来自警方的批评教育。\n与此同时一段视频在互联网上疯狂传播，是对方将身体凑到你的身上，你顺势将他控制在地上。\n评论区意外的一致，都是“姐妹好样的，是我们女性的榜样”。\n你有些欣慰。",
  },
  noOneLikesMe: {
    name: "没有人喜欢我",
    text:
      "因为无数的否定，你崩溃了。\n你发誓，以后再也不来这种地方。\n这不是你的问题，抱抱你。",
  },
  superStar: {
    name: "超级大明星",
    text:
      "你今天真的很亮眼。\n很多人都找你合影，和你交换物料，你超级开心。\n你的QQ也多出了很多的好友，你很享受这种被认可的感觉。",
  },
  nextTime: {
    name: "下次还来",
    text:
      "这是你第一次来这种同人展会。\n大家都很热情，你玩得也很开心，你觉得你下次一定要来。",
  },
  somewhatLost: {
    name: "有些失落",
    text:
      "这是你第一次来这种同人展会。\n你似乎没感到什么正反馈，甚至还有些失落，不知道下次还要不要来。",
  },
  realSomeoneLikesYou: {
    name: "真的会有人喜欢我吗",
    text:
      "这是你第一次来这种同人展会。\n你因为没有太多的正反馈，陷入了深深的自我质疑。\n这不是你的问题，抱抱你。",
  },
  onlineBully: {
    name: "遭到网暴",
    text:
      "回到家，你的朋友转发了一条小红书链接给你。\n点开一看，正是那天的你，评论区还有一群人说你丑就不要来出cos\n你很崩溃，你感觉这辈子都不会再出cos了。\n但是这不是你的问题，抱抱你。",
  },
  wigTorn: {
    name: "头套扯一地",
    text:
      "你的假发和衣服在场地内被撕成了碎片，他们拍着你的视频，肆意地嘲笑你。\n虽然你后来才知道出cos是一定要化妆的，但是你感到很痛苦，这辈子都不想出cos了，甚至你现在看着coser出现都会闪回。",
  },
};

export function getHotelEnergyDelta(hotelId) {
  if (hotelId === "RuSiHaoWeiDeng") return 80;
  if (hotelId === "HuaTing40") return 50;
  if (hotelId === "RuLaiJingXuan") return 20;
  if (hotelId === "HuaJiaoHotel") return 10;
  return 0;
}

// ══════════════════════════════════════════════════════════
//  Domain Helpers (default storyline specific)
// ══════════════════════════════════════════════════════════

export function isHighSchool(role) {
  return role?.templateId === HIGH_SCHOOL_TEMPLATE;
}
export function isCollege(role) {
  return role?.templateId === COLLEGE_TEMPLATE;
}
export function isOffice(role) {
  return role?.templateId === OFFICE_TEMPLATE;
}

export function specialProbForParent(specialId) {
  if (specialId === "none") return 0;
  if (specialId === "mid") return 0.03;
  if (specialId === "strong") return 0.08;
  return 0;
}

function specialProbForOffice(involutionId) {
  if (involutionId === "none") return 0;
  if (involutionId === "mid") return 0.05;
  if (involutionId === "strong") return 0.1;
  return 0;
}

export function parentCheckHook() {
  return (state) => {
    if (isHighSchool(state.role) && state.run?.specialId !== "none") {
      const p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return "ending:hopeMature";
    }
    return null;
  };
}

export function companyCheckHook() {
  return (state) => {
    if (isOffice(state.role) && state.run?.specialId !== "none") {
      const p = specialProbForOffice(state.role.specialId);
      if (Math.random() < p) return "ending:workWhy";
    }
    return null;
  };
}

export function parentAndCompanyCheck(state) {
  if (isHighSchool(state.role) && state.run?.specialId !== "none") {
    if (Math.random() < specialProbForParent(state.role.specialId)) return "ending:hopeMature";
  }
  if (isOffice(state.role) && state.run?.specialId !== "none") {
    if (Math.random() < specialProbForOffice(state.role.specialId)) return "ending:workWhy";
  }
  return null;
}

export function checkEnergyDeath(state) {
  if (state.run?.energy != null && state.run.energy <= 0) return "ending:loveYourself";
  return null;
}

export function checkRecognitionDeath(state) {
  if (state.run?.recognition != null && state.run.recognition <= 0) return "ending:noOneLikesMe";
  return null;
}

export function applyHotelEnergy(state) {
  const delta = getHotelEnergyDelta(state.run?.hotelId);
  state.run.energy = clamp01to100((state.run.energy ?? 0) + delta);
}

export function resolveEndByRecognition(state) {
  const r = state.run?.recognition ?? 0;
  if (r <= 0) return "noOneLikesMe";
  if (r >= 80) return "superStar";
  if (r >= 50) return "nextTime";
  if (r >= 20) return "somewhatLost";
  return "realSomeoneLikesYou";
}

// ── Helpers used by nodes ────────────────────────────────
function sampleWithoutReplacement(pool, count, rng) {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function modeLabel(mode) {
  if (mode === "selfDrive") return "自驾";
  if (mode === "hardSeat") return "硬座";
  if (mode === "highSpeedRail") return "高铁";
  if (mode === "flight") return "飞机";
  return "未知交通";
}

function hotelIdLabel(hotelId) {
  const map = {
    RuSiHaoWeiDeng: "瑞思豪威登",
    HuaTing40: "华庭4.0",
    RuLaiJingXuan: "如来精选",
    HuaJiaoHotel: "花椒酒店",
  };
  return map[hotelId] || String(hotelId || "-");
}

function getMakeupEnergyDelta(bookedTime) {
  return bookedTime === 7 ? -30 : bookedTime === 8 ? -15 : bookedTime === 9 ? -10 : 0;
}

function hasBackpackCosplay(state) {
  return (state.run?.backpackCosplays || []).length >= 1;
}

function getCosplayFromBackpack(state, placeholder = "-") {
  const list = state.run?.backpackCosplays || [];
  return list[0] || placeholder;
}

function isPhonePixel(state) {
  return String(state.run?.phoneLabel || "").includes("Pixel");
}

function isPainCarMazda(state) {
  return String(state.run?.painCarLabel || "").includes("马自达");
}

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function calcEasterWeight(missCount) {
  return Math.min(1 + (missCount ?? 0) * 5, 30);
}

// ── Template text substitution ───────────────────────────
function t(template, state) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (k === "cosplay") return getCosplayFromBackpack(state, "（未知服装）");
    if (k === "painCarModel") return state.run?.painCarLabel || "";
    if (k === "painCarStyle") return state.run?.painCarStyle || "";
    return "";
  });
}

// ══════════════════════════════════════════════════════════
//  Phase D-30: 好想去马娘Only
// ══════════════════════════════════════════════════════════

registerNode("good_want_enzao_gate", (state) => ({
  title: "好想去马娘Only",
  text:
    "这是一个晚上，你在QQ空间看见了列表在某地马娘Only玩得很开心，而你只是一个县城的coser，你知道这种盛大的且好玩的展会，与你这个身在小县城的人无关。\n直到你刷到了下一条说说，标题是：\n省城马娘Only 7/16 正式开展！\n你意识到省会好像离自己很近，于是加入了他们的群。而你看了看钱包和时间，你不知道自己真的能去到那里，和网上那些光鲜亮丽的coser一起玩。",
  choices: [
    { id: "go", label: "去！", next: "shop_enzao", primary: true },
    { id: "skip", label: "还是算了......", next: "ending:neverStartDream" },
    { id: "startArknights", label: "启动某个国产游戏！", next: "ending:ArknightsGameHeatup" },
  ],
}));

// ══════════════════════════════════════════════════════════
//  Shop: 嗯造工坊
// ══════════════════════════════════════════════════════════

registerNode("shop_enzao", (state) => ({
  phaseId: "shop_enzao",
  title: "嗯造工坊",
  text: "欢迎来到嗯造工坊，我们是全国almost 最大的文创产品供应链平台。\n你可以在这里定制各种文创产品，只是交期我们从来都不敢向您保证......\n当然我们现在只提供徽章一种物品，其他物品敬请期待同人社团DLC上线！",
  choices: [
    {
      id: "buy_badges",
      label: "购买徽章*10（金钱-50）",
      primary: true,
      cost: 50,
      effects: { badges: 10, money: -50 },
      next: "d14",
    },
    { id: "skip", label: "还是算了", next: "d14" },
  ],
}));

// ══════════════════════════════════════════════════════════
//  Phase D-14: 角色选择与C服购买跳转
// ══════════════════════════════════════════════════════════

registerNode("d14", (state) => {
  // Parent check on enter
  if (parentAndCompanyCheck(state) === "ending:hopeMature") {
    return { title: "", text: "", choices: [], onEnter: () => "ending:hopeMature" };
  }
  return {
    phaseId: "D-14",
    title: "要出什么角色呢......?",
    text: "你看着那些出着手游新实装角色的决胜服，很好看，虽然你的手里的确有cos服，但因为是出过的，你总希望去这种新场合的时候要有一身新行头。",
    choices: [
      { id: "buy", label: "买套新的", primary: true, next: "shop_taobao" },
      { id: "skip", label: "还是算了", next: "d10" },
    ],
  };
});

// ══════════════════════════════════════════════════════════
//  Shop: 掏宝商城
// ══════════════════════════════════════════════════════════

registerNode("shop_taobao", (state) => {
  const owned = new Set(state.run?.wardrobeCosplays || []);
  const pool = COSPLAY_POOL.filter((n) => !owned.has(n));
  const picks = sampleWithoutReplacement(pool, 4, Math.random);
  state.run.shopCosOptions = picks;

  return {
    phaseId: "shop_taobao",
    title: "掏宝商城-三面卡特斯",
    text: "欢迎来到三面卡特斯的店，这里你能买到各种各样的cos服，种类齐全，价格实惠。\n当然，质量和交期方面，我们就不保证了。反正就我们一家，肯定会有源源不断的coser来给我们送钱，不是吗？\n下面是我们的爆款cos服推荐，欢迎购买~",
    choices: [
      ...picks.map((name, i) => ({
        id: `buy_cos_${i}`,
        label: `购买 ${name} cos服*1（金钱-500）`,
        primary: i === 0,
        cost: 500,
        effects: { cosplayAdd: name, money: -500 },
        next: "d10",
      })),
      { id: "reroll", label: "刷新商店", next: "shop_taobao" },
      { id: "skip", label: "还是算了", next: "d10" },
    ],
  };
});

// ══════════════════════════════════════════════════════════
//  Phase D-10: 预约妆娘
// ══════════════════════════════════════════════════════════

registerNode("d10", (state) => {
  if (parentAndCompanyCheck(state) === "ending:hopeMature") {
    return { title: "", text: "", choices: [], onEnter: () => "ending:hopeMature" };
  }
  return {
    phaseId: "D-10",
    title: "要约化妆师吗",
    text: "距离马O还剩下10天，你发现：如果你需要出cos的话，你需要一个化妆师（当然，群里管这个叫妆娘），虽然约妆的确是有点花钱，但是实际上，如果不化妆的话，除非你是那种超级好看的，否则还是很容易被人头套扯一地。\n当然，如果你想做游客的话，倒也没关系。",
    choices: [
      { id: "yes", label: "去约妆", primary: true, next: "shop_makeup" },
      { id: "no", label: "还是算了，游客，启动！", next: "d7", effects: { runField: { isTourist: true } } },
    ],
  };
});

// ══════════════════════════════════════════════════════════
//  Shop: 约妆
// ══════════════════════════════════════════════════════════

registerNode("shop_makeup", (state) => ({
  phaseId: "shop_makeup",
  title: "约妆",
  text: "宝子们快来找我约妆呀~",
  choices: [
    { id: "makeup_7", label: "预约当天7点的化妆（金钱-40）", primary: true, cost: 40, effects: { runField: { makeupBookedTime: 7 }, money: -40 }, next: "d7" },
    { id: "makeup_8", label: "预约当天8点的化妆（金钱-50）", cost: 50, effects: { runField: { makeupBookedTime: 8 }, money: -50 }, next: "d7" },
    { id: "makeup_9", label: "预约当天9点的化妆（金钱-60）", cost: 60, effects: { runField: { makeupBookedTime: 9 }, money: -60 }, next: "d7" },
    { id: "makeup_10", label: "预约当天10点的化妆（金钱-80）", cost: 80, effects: { runField: { makeupBookedTime: 10 }, money: -80 }, next: "d7" },
    { id: "skip", label: "还是算了", next: "d7" },
  ],
}));

// ══════════════════════════════════════════════════════════
//  Phase D-7: 出行决策 (痛车 / 不顺路)
// ══════════════════════════════════════════════════════════

registerNode("d7", (state) => {
  if (parentAndCompanyCheck(state) === "ending:hopeMature") {
    return { title: "", text: "", choices: [], onEnter: () => "ending:hopeMature" };
  }
  const hasPainCar = state.run.painCarId && state.run.painCarId !== "none";
  if (hasPainCar) {
    return {
      phaseId: "D-7",
      title: "开痛车去吗",
      text: `距离马O还剩下7天，你需要考虑一下你的出行方式。相比其他爱好者来讲，你很幸运有一辆${state.run.painCarLabel}的${state.run.painCarStyle}痛车，你在思考要不要把车开过去。`,
      choices: [
        { id: "paincar_open", label: "开！（需要燃油费-200）", primary: true, cost: 200, effects: { runField: { travelMode: "selfDrive" }, money: -200 }, next: "d5" },
        { id: "paincar_close", label: "不开！", next: "travel_mode" },
      ],
    };
  }
  // Redirect to travel_mode directly
  return { title: "", text: "", choices: [], onEnter: () => "travel_mode" };
});

registerNode("travel_mode", (state) => ({
  phaseId: "D-7",
  title: "出行方式",
  text: "距离马O还剩下7天，你需要考虑一下你的出行方式。\n先打开不顺路出行App看看票吧。",
  choices: [
    { id: "open_app", label: "打开不顺路出行App", primary: true, next: "shop_not_shunlu" },
    { id: "too_expensive", label: "好贵，还是算了", next: "ending:neverStartDream" },
  ],
}));

// ══════════════════════════════════════════════════════════
//  Shop: 不顺路出行
// ══════════════════════════════════════════════════════════

registerNode("shop_not_shunlu", (state) => ({
  phaseId: "shop_not_shunlu",
  title: "不顺路出行",
  text: "欢迎来到不顺路出行，我们可以预约各种各样的交通方式，包给您添堵的。",
  choices: [
    { id: "highspeed", label: "购买高铁票*1（金钱-200）", primary: true, cost: 200, effects: { runField: { travelMode: "highSpeedRail" }, money: -200 }, next: "d5" },
    { id: "flight", label: "购买飞机票*1（金钱-500）", cost: 500, effects: { runField: { travelMode: "flight" }, money: -500 }, next: "d5" },
    { id: "hardseat", label: "购买硬座票*1（金钱-50）", cost: 50, effects: { runField: { travelMode: "hardSeat" }, money: -50 }, next: "d5" },
    { id: "skip", label: "还是算了", next: "ending:neverStartDream" },
  ],
}));

// ══════════════════════════════════════════════════════════
//  Phase D-5: 该住哪里
// ══════════════════════════════════════════════════════════

registerNode("d5", (state) => {
  if (parentAndCompanyCheck(state) === "ending:hopeMature") {
    return { title: "", text: "", choices: [], onEnter: () => "ending:hopeMature" };
  }
  return {
    phaseId: "D-5",
    title: "该住哪里",
    text: "距离马O还剩下5天，你需要考虑一下你到了那边该住哪里，总不能睡大街吧？",
    choices: [
      { id: "open_app", label: "打开不去哪儿网App", primary: true, next: "shop_bu_qu_nar" },
      { id: "too_expensive", label: "好贵，还是算了", next: "ending:neverStartDream" },
    ],
  };
});

// ══════════════════════════════════════════════════════════
//  Shop: 不去哪儿网
// ══════════════════════════════════════════════════════════

registerNode("shop_bu_qu_nar", (state) => ({
  phaseId: "shop_bu_qu_nar",
  title: "不去哪儿网",
  text: "欢迎来到不去哪儿网，我们可以预订从低端到高端各种各样的酒店，至于售后和客服？不存在的！",
  choices: [
    { id: "huaJiao", label: "预定花椒酒店（金钱-80）", primary: true, cost: 80, effects: { runField: { hotelId: "HuaJiaoHotel" }, money: -80 }, next: "d3" },
    { id: "ruLai", label: "预定如来精选（金钱-100）", cost: 100, effects: { runField: { hotelId: "RuLaiJingXuan" }, money: -100 }, next: "d3" },
    { id: "huaTing", label: "预定华庭4.0（金钱-200）", cost: 200, effects: { runField: { hotelId: "HuaTing40" }, money: -200 }, next: "d3" },
    { id: "ruSi", label: "预定瑞思豪威登（金钱-500）", cost: 500, effects: { runField: { hotelId: "RuSiHaoWeiDeng" }, money: -500 }, next: "d3" },
    { id: "skip", label: "没有钱？睡大街！",          cost: 0, effects: { runField: { hotelId: "ShuiDaJie" }, money: -0 }, next: "d3" },
  ],
}));

// ══════════════════════════════════════════════════════════
//  Phase D-3: 展前准备 (选择cos服)
// ══════════════════════════════════════════════════════════

registerNode("d3", (state) => {
  if (parentAndCompanyCheck(state) === "ending:hopeMature") {
    return { title: "", text: "", choices: [], onEnter: () => "ending:hopeMature" };
  }
  const wardrobe = state.run.wardrobeCosplays || [];
  const options = wardrobe.map((id) => ({ value: id, label: String(id) }));
  const isTourist = state.run.isTourist;

  return {
    phaseId: "D-3",
    title: "展前准备",
    text: "马上就要出发了，是出很美丽的cos，还是只是做一个普通游客呢？\n下拉菜单中选择你已经拥有的cos。",
    select: {
      label: "选择cos服",
      options: options.length ? options : [{ value: "", label: "（无可选cos）" }],
    },
    choices: [
      {
        id: "pick",
        label: "就决定是你了！",
        primary: true,
        next: "d1",
        disabled: !!isTourist,
        disabledHint: isTourist ? "你在此之前已经选择了以游客的形式参与" : "",
        // Effect handled in onChoice hook below
      },
      { id: "skip", label: "还是算了，游客，启动！", next: "d1" },
    ],
    onChoice: (st, choiceId, ctx) => {
      if (choiceId === "pick") {
        const selected = ctx.selectedValue;
        if (selected) {
          const idx = (st.run.wardrobeCosplays || []).indexOf(selected);
          if (idx >= 0) {
            st.run.wardrobeCosplays.splice(idx, 1);
            st.run.backpackCosplays = [...(st.run.backpackCosplays || []), selected];
          }
        }
      }
      if (choiceId === "skip" && st.run.makeupBookedTime != null) {
        // If makeup booked but trying to skip, block with modal
        return "d3"; // stay on same node, caller should show modal
      }
      return null;
    },
  };
});

// ══════════════════════════════════════════════════════════
//  Phase D-1: 出发 / 马O途中
// ══════════════════════════════════════════════════════════

registerNode("d1", (state) => {
  if (parentAndCompanyCheck(state) === "ending:hopeMature") {
    return { title: "", text: "", choices: [], onEnter: () => "ending:hopeMature" };
  }
  // Init energy
  state.run.energy = 100;
  const mode = state.run.travelMode;
  const delta = mode === "selfDrive" ? -30 : mode === "hardSeat" ? -60 : mode === "highSpeedRail" ? -30 : mode === "flight" ? -20 : 0;
  state.run.energy = clamp01to100((state.run.energy ?? 0) + delta);

  // Check energy death
  if (state.run.energy <= 0) {
    return { title: "", text: "", choices: [], onEnter: () => "ending:loveYourself" };
  }

  return {
    phaseId: "D-1",
    title: "马O途中",
    text: `你通过${modeLabel(mode)}，经过了几个小时的路程之后，终于到达了省城。\n看着省城里的高楼大厦，你很感慨。你也梦想着有朝一日，能够在这样的大城市里生活。`,
    choices: [{ id: "arrive", label: "到达目的地", primary: true, next: "event_dinner" }],
  };
});

// ══════════════════════════════════════════════════════════
//  晚餐时间
// ══════════════════════════════════════════════════════════

registerNode("event_dinner", (state) => ({
  phaseId: "dinner",
  title: "晚餐时间",
  text: "你终于到了省城，舟车劳顿之后你感到很饿。\n掏出手机，你打开「饱了吗」App，发现这里的饭菜远比那个小县城里要丰富上数倍。",
  choices: [
    { id: "barbeque", label: "用饱了吗App点餐：自助烤肉（精力+40，金钱-80）", primary: true, cost: 80, effects: { energy: 40, money: -80 }, next: "event_hotel" },
    { id: "mcn", label: "用饱了吗App点餐：麦肯王（精力+20，金钱-40）", cost: 40, effects: { energy: 20, money: -40 }, next: "event_hotel" },
    { id: "mala", label: "用饱了吗App点餐：张福麻辣烫（精力+10，金钱-20）", cost: 20, effects: { energy: 10, money: -20 }, next: "event_hotel" },
    { id: "skip", label: "好贵，还是算了（精力-20）", effects: { energy: -20 }, next: "event_hotel" },
  ],
}));

// ══════════════════════════════════════════════════════════
//  入住酒店/睡大街判断
// ══════════════════════════════════════════════════════════

registerNode("event_hotel", (state) => {
  const hotelId = state.run.hotelId;
  // 睡大街情况重定向到对应节点
  if (hotelId === "ShuiDaJie") {
    return { title: "", text: "", choices: [], onEnter: () => "event_meiqianshuidajie" };
  }
  return {
    phaseId: "hotel",
    title: "入住酒店",
    text: `吃过晚饭，你入住了${hotelIdLabel(hotelId)}。你放下背包，简单洗了个澡，准备睡觉。\n你此刻感觉充满了信心。`,
    choices: [{ id: "next_day", label: "迎接第二天", primary: true, next: "morning" }],
  };
});

registerNode("event_meiqianshuidajie", (state) => {
  const hotelId = state.run.hotelId;
  return {
    phaseId: "hotel",
    title: "睡大街了",
    text: `吃过晚饭，由于你确实没钱预订酒店，但好在你准备了睡大街的各种工具。\n简单收拾之后，你找到了地铁站附近的一个长椅，手机打开省电模式，准备在这里凑合一晚。\n虽然这个地方确实有点冷，但好在你平安无事地挺过了一晚。`,
    choices: [{ id: "next_day", label: "迎接第二天", primary: true, next: "morning_onstreet" }],
  };
});

// ══════════════════════════════════════════════════════════
//  那一天的早上
// ══════════════════════════════════════════════════════════

registerNode("morning", (state) => {
  // Parent + company check
  if (parentAndCompanyCheck(state) === "ending:hopeMature") {
    return { title: "", text: "", choices: [], onEnter: () => "ending:hopeMature" };
  }
  // Apply hotel energy
  applyHotelEnergy(state);
  if (state.run.energy <= 0) {
    return { title: "", text: "", choices: [], onEnter: () => "ending:loveYourself" };
  }

  const hasCos = (state.run.backpackCosplays || []).length > 0;
  const hasMakeupBooked = !!state.run.makeupBookedTime;

  const choices = [];
  if (!hasCos && !hasMakeupBooked) {
    choices.push({ id: "direct", label: "直接出发", primary: true, next: "subway" });
  }
  if (hasCos && !hasMakeupBooked) {
    choices.push({ id: "prepare", label: "换上cos服，准备出发", primary: true, next: "subway" });
  }
  if (hasCos && hasMakeupBooked) {
    choices.push({ id: "go_makeup", label: "换上cos服，前往化妆", primary: true, next: "event_to_makeup" });
  }
  if (!choices.length) {
    choices.push({ id: "direct_fallback", label: "直接出发", primary: true, next: "subway" });
  }

  return {
    phaseId: "那一天的早上",
    title: "那一天的早上",
    text: "早上起来，你看着楼下三三两两地出现了一些coser，你很开心，你也想加入他们，可你和他们......真的很熟吗？",
    choices,
    onEnter: (st) => {
      // If time not set, default 9:00 (for direct/prepare), but don't override makeup time
      if (st.run.timeMinutes == null) st.run.timeMinutes = 6 * 60;
      return null;
    },
  };
});

// ══════════════════════════════════════════════════════════
//  睡大街早上起来
// ══════════════════════════════════════════════════════════

registerNode("morning_onstreet", (state) => {
  // Parent + company check
  if (parentAndCompanyCheck(state) === "ending:hopeMature") {
    return { title: "", text: "", choices: [], onEnter: () => "ending:hopeMature" };
  }
  // Apply hotel energy
  applyHotelEnergy(state);
  if (state.run.energy <= 0) {
    return { title: "", text: "", choices: [], onEnter: () => "ending:loveYourself" };
  }

  const hasCos = (state.run.backpackCosplays || []).length > 0;
  const hasMakeupBooked = !!state.run.makeupBookedTime;

  const choices = [];
  if (!hasCos && !hasMakeupBooked) {
    choices.push({ id: "direct", label: "直接出发", primary: true, next: "subway" });
  }
  if (hasCos && !hasMakeupBooked) {
    choices.push({ id: "prepare", label: "带好cos服，准备出发", primary: true, next: "subway" });
  }
  if (hasCos && hasMakeupBooked) {
    choices.push({ id: "go_makeup", label: "带好cos服，前往化妆", primary: true, next: "event_to_makeup" });
  }
  if (!choices.length) {
    choices.push({ id: "direct_fallback", label: "直接出发", primary: true, next: "subway" });
  }

  return {
    phaseId: "从街头醒来",
    title: "从街头醒来",
    text: "凌晨四点，你从公园长椅上起来，天刚蒙蒙亮，你有点腰酸背痛。\n广场上有几个大爷似乎在准备晨练，远处听到餐车的声音。你看了看身边的东西，幸好没丢，你想着在这种地方过夜，人没事就行。\n然后你拿出手机，不错，还有一半的电。看了看群里，还有一些人在说话，你意识到这个时间确实有些早了，于是你决定找个地方坐一会，等待化妆的时间。",
    choices,
    onEnter: (st) => {
      // If time not set, default 9:00 (for direct/prepare), but don't override makeup time
      if (st.run.timeMinutes == null) st.run.timeMinutes = 4 * 60;
      return null;
    },
  };
});

// ══════════════════════════════════════════════════════════
//  前往化妆 / 妆娘跑路
// ══════════════════════════════════════════════════════════

registerNode("event_to_makeup", (state) => {
  if (Math.random() < 1 / 30) {
    // Makeup artist runs away!
    return {
      title: "妆娘跑路了！",
      text: "你和其他找这位妆娘化妆的同好们集体在酒店楼下傻了眼，因为你们发现，无论是微信语音还是电话，没有一样可以接通。\n最终你和他们傻等了两个小时，只好顶着一张没化过妆的脸赶去马娘Only的现场，并希望不要被人头套扯一地。",
      choices: [{ id: "grit", label: "硬着头皮，挤上地铁", primary: true, next: "subway" }],
      onEnter: (st) => {
        st.run.makeupDone = false;
        const bookedBase = (st.run.makeupBookedTime ?? 9) * 60;
        st.run.timeMinutes = bookedBase + 120;
        return null;
      },
    };
  }
  return {
    title: "前往化妆",
    text: "你来到化妆师所在的地方，这是你第一次被别人化妆，你感觉是很新奇的体验。",
    choices: [{ id: "done", label: "化妆完成，准备出发", primary: true, next: "event_go_makeup_result" }],
  };
});

// Internal: apply makeup energy + time, then show after-makeup node
registerNode("event_go_makeup_result", (state) => {
  const time = state.run.makeupBookedTime;
  const energyDelta = getMakeupEnergyDelta(time);
  state.run.energy = clamp01to100((state.run.energy ?? 0) + energyDelta);
  state.run.timeMinutes = time * 60 + 60;
  state.run.makeupDone = true;

  if (state.run.energy <= 0) {
    return { title: "", text: "", choices: [], onEnter: () => "ending:loveYourself" };
  }

  const energyText = energyDelta === 0 ? "你的精力值没有变化。" : `你的精力值${energyDelta}。`;
  return {
    title: "化妆完成",
    text: `化妆结束后，你看着镜子里的自己，心情复杂又有点兴奋。\n你预约的是当天${time}:00的化妆，整个化妆过程花费了1个小时。${energyText}`,
    choices: [{ id: "depart", label: "准备出发", primary: true, next: "subway" }],
  };
});

// ══════════════════════════════════════════════════════════
//  地铁上 (性别事件)
// ══════════════════════════════════════════════════════════

registerNode("subway", (state) => {
  state.phaseId = "在地铁上";

  // 自驾模式跳过地铁事件，直达现场
  if (state.run.travelMode === "selfDrive") {
    return { title: "", text: "", choices: [], onEnter: () => "subway_wind" };
  }

  if (state.run.timeMinutes == null) state.run.timeMinutes = 9 * 60;

  // Parent + company check
  const check = parentAndCompanyCheck(state);
  if (check) {
    return { title: "", text: "", choices: [], onEnter: () => check };
  }

  // Gender event: 50% trigger, then 80% for the gender-specific event
  const gender = state.run.gender;
  const trigger10 = Math.random() < 0.7;
  let nextNode = "subway_wind";
  if (trigger10) {
    if (gender === 0) {
      nextNode = Math.random() < 0.8 ? "subway_not_man_woman" : "subway_wind";
    } else {
      nextNode = Math.random() < 0.8 ? "subway_man_flirt" : "subway_wind";
    }
  }

  // Return the target node directly
  return { title: "", text: "", choices: [], onEnter: () => nextNode };
});

// ── 不男不女 ──
registerNode("subway_not_man_woman", (state) => ({
  phaseId: "在地铁上",
  title: "不男不女",
  text: `你穿着赛马娘的cos服，这时一个看起来不怀好意的老大爷走过来，突然指着你，质问你「男的女的？穿这种日本动漫的衣服干什么？你是什么目的？」`,
  choices: [
    { id: "ignore", label: "不予理会（精力值-10）", primary: true, effects: { energy: -10, timeMinutes: 30 }, next: "only_welcome" },
    { id: "explain", label: "试图说明（？？？）", next: "subway_not_man_woman_explain" },
  ],
}));

registerNode("subway_not_man_woman_explain", (state) => {
  const hit = Math.random() < 0.5;
  if (hit) {
    return {
      title: "干什么！",
      text: "对方丝毫不理会你，甚至被你的行为激怒了，在一阵怒吼之后，他扑上来大喊「你是不是男的？是不是没长那玩意？我现在就把你的衣服扒下来！」，此时你意识到不对，凭借体力优势，将其控制在地上。这时，乘警来到了你的附近......",
      choices: [{ id: "help", label: "协助调查", primary: true, next: "ending:selfDefense" }],
      onEnter: () => { /* achievement handled by caller */ return null; },
    };
  }
  return {
    title: "解释清楚",
    text: "幸好这个老大爷看起来不是那么不讲理，在经历了一番劝说之后，老大爷终于收起了锋芒，在下一站离开了车厢。你有点纳闷，现在的老年人怎么这样？",
    choices: [{ id: "continue", label: "问题解决", primary: true, next: "only_welcome" }],
    onEnter: (st) => {
      st.run.timeMinutes += 30;
      return st.run.energy <= 0 ? "ending:loveYourself" : null;
    },
  };
});

// ── 被男性搭讪 ──
registerNode("subway_man_flirt", (state) => ({
  phaseId: "在地铁上",
  title: "被男性搭讪",
  text: "你穿着赛马娘的cos服，这时一个看起来不怀好意的男子走过来，贴近了你，问你「小姐姐是不是玩cos的？加个好友？」",
  choices: [
    { id: "ignore", label: "不予理会（精力值-10）", primary: true, effects: { energy: -10, timeMinutes: 30 }, next: "only_welcome" },
    { id: "refuse", label: "试图拒绝（？？？）", next: "subway_man_flirt_refuse" },
  ],
}));

registerNode("subway_man_flirt_refuse", (state) => {
  const hit = Math.random() < 0;
  if (hit) {
    return {
      title: "勇敢说不",
      text: "对方丝毫不理会你，开始伸出手来，此时你意识到不对，因为学过跆拳道的原因，你成功将其控制在地上。这时，乘警来到了你的附近......",
      choices: [{ id: "help", label: "协助调查", primary: true, next: "ending:braveGirl" }],
    };
  }
  return {
    title: "有惊无险",
    text: "还好对方只是单纯想要扩列，在说清了不想加好友之后，对方也就离开了你，去到了下一节车厢。你有点纳闷，现在的人是不是抖音刷多了？",
    choices: [{ id: "continue", label: "问题解决", primary: true, next: "only_welcome" }],
    onEnter: (st) => {
      st.run.timeMinutes += 30;
      return st.run.energy <= 0 ? "ending:loveYourself" : null;
    },
  };
});

// ── 风平浪静 (subway) ──
registerNode("subway_wind", (state) => ({
  phaseId: "在地铁上",
  title: "风平浪静",
  text: "你在路上风平浪静，没有发生任何事情，安全抵达了现场。",
  choices: [{ id: "get_off", label: "进入地点", primary: true, next: "only_welcome" }],
  onEnter: (st) => { st.run.timeMinutes += 30; return null; },
}));

// ══════════════════════════════════════════════════════════
//  欢迎来到马娘Only
// ══════════════════════════════════════════════════════════

registerNode("only_welcome", (state) => {
  state.phaseId = "欢迎来到马娘Only";
  if (state.run.recognition == null) state.run.recognition = 50;

  // Parent + company check (double: now + 1 hour later)
  const check1 = parentAndCompanyCheck(state);
  if (check1) return { title: "", text: "", choices: [], onEnter: () => check1 };

  state.run.timeMinutes += 60;
  const check2 = parentAndCompanyCheck(state);
  if (check2) return { title: "", text: "", choices: [], onEnter: () => check2 };

  if ((state.run.timeMinutes ?? 0) < 10 * 60) {
    return {
      title: "稍作等待",
      text: `现在时间是${formatTimeHHMM(state.run.timeMinutes)}，你决定稍作等待，等到10点准时进入。`,
      choices: [{ id: "wait", label: "继续", primary: true, next: "exhibition_loop" }],
      onEnter: (st) => { st.run.timeMinutes = 10 * 60; return null; },
    };
  }

  return { title: "", text: "", choices: [], onEnter: () => "exhibition_loop" };
});

// ══════════════════════════════════════════════════════════
//  展会事件循环 (exhibition_loop)
// ══════════════════════════════════════════════════════════

registerNode("exhibition_loop", (state) => {
  // Time check: if >= 18:00, go to after_only
  if ((state.run.timeMinutes ?? 0) >= 18 * 60) {
    return { title: "", text: "", choices: [], onEnter: () => "after_only" };
  }

  // Decay recognition: -2 per slot
  state.run.recognition = clamp01to100((state.run.recognition ?? 0) - 2);
  if (state.run.recognition <= 0) {
    return { title: "", text: "", choices: [], onEnter: () => "ending:noOneLikesMe" };
  }

  // Pick random exhibition event
  const eventId = weightedPick(
    [
      { id: "ex_wind", weight: 2 },
      { id: "ex_post", weight: 55 },
      { id: "ex_great_creator", weight: 10 },
      { id: "ex_stage_program", weight: 10 },
      { id: "ex_expansion", weight: 10 },
      { id: "ex_paincar_approved", weight: 10 },
      { id: "ex_no_makeup", weight: 10 },
      { id: "ex_pixel_easter", weight: calcEasterWeight(state.pixelMissCount ?? 0) },
      { id: "ex_zoom_zoom", weight: calcEasterWeight(state.zoomMissCount ?? 0) },
    ],
    Math.random,
  );

  // Redirect to the specific event node
  return { title: "", text: "", choices: [], onEnter: () => eventId };
});

// ── 展会: 风平浪静 ──
registerNode("ex_wind", (state) => ({
  title: "风平浪静",
  text: "这段时间似乎什么都没发生，你选择继续游场。",
  choices: [{ id: "continue", label: "继续游场（认可度-5）", primary: true, effects: { recognition: -5, timeMinutes: 30 }, next: "exhibition_loop" }],
}));

// ── 展会: 被集邮 / 和老师集邮 ──
registerNode("ex_post", (state) => {
  const hasCos = hasBackpackCosplay(state);
  if (!hasCos) {
    return {
      title: "可以和老师集邮吗？",
      text: "你看到了一个coser，觉得他很好看，你想要和他合影。",
      choices: [
        { id: "btn1", label: "合影并递上周边（认可度+3，周边数量-1）", primary: true, requiresBadges: 1, effects: { recognition: 3, badges: -1, timeMinutes: 30 }, next: "exhibition_loop" },
        { id: "btn2", label: "合影（认可度+1）", effects: { recognition: 1, timeMinutes: 30 }, next: "exhibition_loop" },
        { id: "btn3", label: "还是不了（认可度-5）", effects: { recognition: -5, timeMinutes: 30 }, next: "exhibition_loop" },
      ],
    };
  }
  return {
    title: "被集邮了！",
    text: t("有人觉得你cos的{{cosplay}}很好看，他想要和你合影。", state),
    choices: [
      { id: "btn1", label: "合影并递上周边（认可度+5，周边数量-1）", primary: true, requiresBadges: 1, effects: { recognition: 5, badges: -1, timeMinutes: 30 }, next: "exhibition_loop" },
      { id: "btn2", label: "合影（认可度+3）", effects: { recognition: 3, timeMinutes: 30 }, next: "exhibition_loop" },
      { id: "btn3", label: "还是不了（认可度-5）", effects: { recognition: -5, timeMinutes: 30 }, next: "exhibition_loop" },
    ],
  };
});

// ── 展会: 很棒的同人老师 ──
registerNode("ex_great_creator", (state) => ({
  title: "很棒的同人老师",
  text: "你遇到了一个你十分喜欢的同人摊位，角色和风格都很戳你，这让你想要购买。",
  choices: [
    { id: "btn1", label: "立即购买（认可度+10，金钱-20）", primary: true, cost: 20, effects: { recognition: 10, money: -20, timeMinutes: 30 }, next: "exhibition_loop" },
    { id: "btn2", label: "还是不了", effects: { timeMinutes: 30 }, next: "exhibition_loop" },
  ],
}));

// ── 展会: 喜欢的舞台节目 ──
registerNode("ex_stage_program", (state) => ({
  title: "喜欢的舞台节目",
  text: "你看到了非常喜欢的舞台节目，他的舞姿如此有张力，以至于你感到精神都升华到了新的境界。",
  choices: [{ id: "btn1", label: "きみの愛馬が!", primary: true, effects: { energy: 10, timeMinutes: 30 }, next: "exhibition_loop" }],
  autoDisableMs: 3000,
}));

// ── 展会: 扩列了！ ──
registerNode("ex_expansion", (state) => ({
  title: "扩列了！",
  text: "你遇到了一位同人作者，她递给你一份无料，其中的自我介绍，你觉得这是一个很有态度的人......",
  choices: [
    { id: "btn1", label: "加好友并交换周边（认可度+10，周边数量-1）", primary: true, requiresBadges: 1, effects: { recognition: 10, badges: -1, timeMinutes: 30 }, next: "exhibition_loop" },
    { id: "btn3", label: "加好友（认可度+3）", effects: { recognition: 3, timeMinutes: 30 }, next: "exhibition_loop" },
    { id: "btn2", label: "还是不了（认可度-5）", effects: { recognition: -5, timeMinutes: 30 }, next: "exhibition_loop" },
  ],
}));

// ── 展会: 痛车相关 ──
registerNode("ex_paincar_approved", (state) => {
  const selfDrive = state.run.travelMode === "selfDrive";
  if (!selfDrive) {
    const painCar = CAR_MODELS[randInt(Math.random, 0, CAR_MODELS.length - 1)];
    const painCarLabel = getCarLabel(painCar.id);
    const painUma = UMA_NAMES[randInt(Math.random, 0, UMA_NAMES.length - 1)];
    return {
      title: "这车真帅吧",
      text: `你看到了一辆${painCarLabel}的${painUma}痛车，非常喜欢。你对车主表达了赞叹，并想要拍一张照片。`,
      choices: [
        { id: "btn1", label: "拍照并递上周边（认可度+5，周边数量-1）", primary: true, requiresBadges: 1, effects: { recognition: 5, badges: -1, timeMinutes: 30 }, next: "exhibition_loop" },
        { id: "btn2", label: "拍照（认可度+1）", effects: { recognition: 1, timeMinutes: 30 }, next: "exhibition_loop" },
        { id: "btn3", label: "还是不了（认可度-5）", effects: { recognition: -5, timeMinutes: 30 }, next: "exhibition_loop" },
      ],
    };
  }
  return {
    title: "痛车得到认可",
    text: t("你的{{painCarModel}}的{{painCarStyle}}痛车得到了极大的认可，有coser和你的痛车合影，而且还大赞你的痛车十分有品。", state),
    choices: [{ id: "btn1", label: "感谢他（认可度+10）", primary: true, effects: { recognition: 10, timeMinutes: 30 }, next: "exhibition_loop" }],
  };
});

// ── 展会: 没化妆 / 奇怪的眼神 ──
registerNode("ex_no_makeup", (state) => {
  const cosInBackpack = hasBackpackCosplay(state);
  const makeupDone = !!state.run.makeupDone;
  const first = !state.run.flags?.noMakeupFirstUsed;

  // No cos & no makeup => wind
  if (!cosInBackpack && !makeupDone) {
    return { title: "", text: "", choices: [], onEnter: () => "ex_wind" };
  }

  // 奇怪的眼神（同时出C和化妆）
  if (cosInBackpack && makeupDone) {
    return {
      title: "奇怪的眼神",
      text: t("在游场的过程中，你听到了身边有人在看着你，而且还不知道在嘀咕什么。\n“你看那个，他出的{{cosplay}}好不还原，真是毁角色！”\n“没事，我现在把他拍下来，然后马上投厕，有的是人骂他。”\n其中一个人举起手机，摄像头对准了你，就在他按下快门之前，你转过身来看着他们......", state),
      choices: [
        { id: "btn1", label: "掷骰子！", primary: true, next: "dice_roll" },
        { id: "btn2", label: "不阻止（认可度-40）", effects: { recognition: -40, timeMinutes: 30 }, next: "exhibition_loop" },
        { id: "btn3", label: "阻止对方的侵权行为（认可度-20，精力值-20）", effects: { recognition: -20, energy: -20, timeMinutes: 30 }, next: "exhibition_loop" },
      ],
      onChoice: (st, choiceId) => {
        if (choiceId === "btn1") {
          // Set up dice pending
          st.run.pendingDice = {
            onWin: { action: "continue" },
            onLose: { action: "ending", ending: "onlineBully" },
            onDraw: { action: "penalty", recognition: -20, energy: -20 },
          };
        }
        return null;
      },
    };
  }

  // 出C不化妆（仅首次）
  if (cosInBackpack && !makeupDone) {
    if (!first) return { title: "", text: "", choices: [], onEnter: () => "ex_wind" };
    if (!state.run.flags) state.run.flags = {};
    state.run.flags.noMakeupFirstUsed = true;
    return {
      title: "没化妆......",
      text: "有人注意到了你，你的皮肤上似乎没有任何化妆品的痕迹。\n由于各种原因，妆娘跑路也好，忘记下单也好，总之你意识到自己没化妆被人发现了。\n而事情的展开总比你想象的还要快，他拦住了你。\n“不是，你不化妆出什么cos啊，是害怕别人不知道你长得丑吗？”他指着你的脸，唾沫星子溅到了你的脸上。\n“我告诉你，{{cosplay}}是我推，你这样做就是在侮辱她，反正今天我不把你衣服扒下来你跑不了！”对方继续张牙舞爪，甚至试图要动手......",
      choices: [
        { id: "btn1", label: "跑！（认可度-50）", primary: true, effects: { recognition: -50, timeMinutes: 30 }, next: "exhibition_loop" },
        { id: "btn2", label: "掷骰子！", next: "dice_roll" },
        { id: "btn3", label: "呼叫保安（认可度-20，精力值-20）", effects: { recognition: -20, energy: -20, timeMinutes: 30 }, next: "exhibition_loop" },
      ],
      onChoice: (st, choiceId) => {
        if (choiceId === "btn2") {
          st.run.pendingDice = {
            onWin: { action: "continue" },
            onLose: { action: "ending", ending: "wigTorn" },
            onDraw: { action: "penalty", recognition: -20, energy: -20 },
          };
        }
        return null;
      },
    };
  }

  return { title: "", text: "", choices: [], onEnter: () => "ex_wind" };
});

// ── 展会: Pixel彩蛋 ──
registerNode("ex_pixel_easter", (state) => {
  const good = isPhonePixel(state);
  if (!good || state.run.flags?.easterHasPinUsed) {
    return { title: "", text: "", choices: [], onEnter: () => "ex_wind" };
  }
  // Mark used, reset miss count
  if (!state.run.flags) state.run.flags = {};
  state.run.flags.easterHasPinUsed = true;
  state.pixelMissCount = 0;

  return {
    title: "有品！",
    text: "有人看到了你用Pixel手机，感觉你十分有品。想要和你扩列。",
    choices: [
      { id: "btn1", label: "加好友并交换周边（认可度+50，周边数量-1）", primary: true, requiresBadges: 1, effects: { recognition: 50, badges: -1, timeMinutes: 30 }, next: "exhibition_loop" },
      { id: "btn2", label: "还是不了", effects: { timeMinutes: 30 }, next: "exhibition_loop" },
    ],
    autoDisableMs: 3000,
  };
});

// ── 展会: Zoom-Zoom彩蛋 ──
registerNode("ex_zoom_zoom", (state) => {
  const mazda = isPainCarMazda(state);
  const sd = state.run.travelMode === "selfDrive";
  const used = !!state.run.flags?.easterZoomZoomUsed;
  if (!mazda || !sd || used) {
    return { title: "", text: "", choices: [], onEnter: () => "ex_wind" };
  }
  if (!state.run.flags) state.run.flags = {};
  state.run.flags.easterZoomZoomUsed = true;
  state.zoomMissCount = 0;

  return {
    title: "Zoom-Zoom",
    text: t("有人看到了你{{painCarModel}}的{{painCarStyle}}痛车。\n“哟？马自达？这牌子，我现在见得越来越少了。”他拍了拍你的肩膀。\n“怎么说，你也开马自达？”你试探性地问。\n“RX-8，原装进口，一汽引进，全国为数不多能上路的转子发动机车型。”他指了指远处的RX-8，随手掏出了带有三角转子logo的车钥匙。\n“我去，玩转子的，幸会幸会。”你看他和RX-8的眼神多了几分光。\n......\n在接下来的几十分钟里，你们相谈甚欢，这时他问你要不要加个好友。", state),
    choices: [
      { id: "btn1", label: "加好友并交换周边（认可度+50，周边数量-1）", primary: true, requiresBadges: 1, effects: { recognition: 50, badges: -1, timeMinutes: 30 }, next: "exhibition_loop" },
      { id: "btn2", label: "还是不了", effects: { timeMinutes: 30 }, next: "exhibition_loop" },
    ],
    autoDisableMs: 3000,
  };
});

// ══════════════════════════════════════════════════════════
//  骰子系统
// ══════════════════════════════════════════════════════════

registerNode("dice_roll", (state) => ({
  title: state.nodeTitle || "骰子对决",
  text: "你决定正面应对，和对方来一场骰子对决。",
  choices: [{ id: "go", label: "掷骰子！", primary: true, next: "dice_result" }],
  onEnter: (st) => {
    st.run._dicePlayer = rollDice();
    st.run._diceOpponent = rollDice();
    return null;
  },
}));

registerNode("dice_result", (state) => {
  const playerRoll = state.run._dicePlayer;
  const opponentRoll = state.run._diceOpponent;
  let resultKey;
  if (playerRoll > opponentRoll) resultKey = "onWin";
  else if (playerRoll < opponentRoll) resultKey = "onLose";
  else resultKey = "onDraw";

  const next = state.run.pendingDice?.[resultKey];
  const desc = playerRoll > opponentRoll ? "你赢了！" : playerRoll < opponentRoll ? "你输了......" : "平局。";

  return {
    title: "骰子结果",
    text: `你掷出了 ${DICE_FACES[playerRoll - 1]}${playerRoll}，对手掷出了 ${DICE_FACES[opponentRoll - 1]}${opponentRoll}。\n${desc}`,
    choices: [{ id: "next", label: "继续", primary: true, next: "dice_aftermath" }],
  };
});

registerNode("dice_aftermath", (state) => {
  // Process dice result
  const playerRoll = state.run._dicePlayer;
  const opponentRoll = state.run._diceOpponent;
  let resultKey;
  if (playerRoll > opponentRoll) resultKey = "onWin";
  else if (playerRoll < opponentRoll) resultKey = "onLose";
  else resultKey = "onDraw";

  const next = state.run.pendingDice?.[resultKey];
  if (next?.action === "ending") {
    return { title: "", text: "", choices: [], onEnter: () => `ending:${next.ending}` };
  }
  if (next?.action === "penalty") {
    state.run.recognition = clamp01to100((state.run.recognition ?? 0) + (next.recognition || 0));
    state.run.energy = clamp01to100((state.run.energy ?? 0) + (next.energy || 0));
  }
  // Continue: advance time and loop
  state.run.timeMinutes += 30;
  if (state.run.recognition <= 0) {
    return { title: "", text: "", choices: [], onEnter: () => "ending:noOneLikesMe" };
  }
  if (state.run.energy <= 0) {
    return { title: "", text: "", choices: [], onEnter: () => "ending:loveYourself" };
  }
  if (state.run.timeMinutes >= 18 * 60) {
    return { title: "", text: "", choices: [], onEnter: () => "after_only" };
  }
  return { title: "", text: "", choices: [], onEnter: () => "exhibition_loop" };
});

// ══════════════════════════════════════════════════════════
//  马O之后: 聚餐
// ══════════════════════════════════════════════════════════

registerNode("after_only", (state) => {
  state.phaseId = "马O之后";
  const check = parentAndCompanyCheck(state);
  if (check) return { title: "", text: "", choices: [], onEnter: () => check };

  return {
    title: "要聚餐吗",
    text: "刚刚结束了的马娘Only，大家似乎意犹未尽，于是有人提议去聚餐。你刚刚认识的新朋友也要拉着你一起。",
    choices: [
      { id: "yes", label: "去！（金钱-50，精力值+30，认可值+10）", primary: true, cost: 50, effects: { energy: 30, recognition: 10, money: -50 }, next: "go_home" },
      { id: "no", label: "不去！", next: "go_home" },
    ],
  };
});

// ══════════════════════════════════════════════════════════
//  各回各家 → 结局
// ══════════════════════════════════════════════════════════

registerNode("go_home", (state) => {
  state.phaseId = "各回各家";
  const mode = state.run.travelMode;
  const delta = mode === "selfDrive" ? -30 : mode === "hardSeat" ? -60 : mode === "highSpeedRail" ? -30 : mode === "flight" ? -20 : 0;
  state.run.energy = clamp01to100((state.run.energy ?? 0) + delta);

  if (state.run.energy <= 0) {
    return { title: "", text: "", choices: [], onEnter: () => "ending:loveYourself" };
  }

  return {
    title: "各回各家",
    text: `你通过${modeLabel(mode)}，经过了几个小时的路程之后，终于回到了小县城。\n回想着今天经历的一切，你的泪水慢慢地滑了出来。你不知道以后还有没有机会和他们见面。`,
    choices: [{ id: "arrive", label: "到达目的地", primary: true, next: "resolve_ending" }],
  };
});

// Final ending resolution
registerNode("resolve_ending", (state) => {
  const r = state.run?.recognition ?? 0;
  let endingKey;
  if (r <= 0) endingKey = "noOneLikesMe";
  else if (r >= 80) endingKey = "superStar";
  else if (r >= 50) endingKey = "nextTime";
  else if (r >= 20) endingKey = "somewhatLost";
  else endingKey = "realSomeoneLikesYou";
  return { title: "", text: "", choices: [], onEnter: () => `ending:${endingKey}` };
});

// ══════════════════════════════════════════════════════════
//  Export: call this once on init to register all nodes
// ══════════════════════════════════════════════════════════

export function registerAllNodes() {
  // All nodes are registered via side-effect at module import.
  // This function exists for explicit initialization if needed.
}

// ══════════════════════════════════════════════════════════
//  Storyline Interface — used by game.js
// ══════════════════════════════════════════════════════════

export function getFirstNodeId() {
  return "good_want_enzao_gate";
}

export function createRoleSelection(genderOverride, rng = Math.random) {
  const templateId = weightedPick(
    [
      { id: HIGH_SCHOOL_TEMPLATE, weight: 1 },
      { id: COLLEGE_TEMPLATE, weight: 1 },
      { id: OFFICE_TEMPLATE, weight: 1 },
    ],
    rng,
  );
  let money;
  let wardrobeCosCount;
  let hasPainCar = false;
  let painCarOptions = null;

  if (isHighSchool({ templateId })) {
    money = 300;
    wardrobeCosCount = 1;
    hasPainCar = false;
  } else if (isCollege({ templateId })) {
    money = 1000;
    wardrobeCosCount = 2;
    hasPainCar = true;
    painCarOptions = PAIN_CAR_MODELS_UNIVERSITY;
  } else {
    money = 2000;
    wardrobeCosCount = 3;
    hasPainCar = true;
    painCarOptions = PAIN_CAR_MODELS_OFFICE;
  }

  const gender = (genderOverride === 0 || genderOverride === 1)
    ? genderOverride
    : weightedPick(
        [
          { id: 0, weight: 1 },
          { id: 1, weight: 1 },
        ],
        rng,
      );

  let specialId = "none";
  let specialLabel = "-";
  if (templateId === HIGH_SCHOOL_TEMPLATE || templateId === OFFICE_TEMPLATE) {
    const specialLevels = ["none", "mid", "strong"];
    specialId = specialLevels[randInt(rng, 0, 2)];
    specialLabel = specialId === "none" ? "无" : specialId === "mid" ? "中" : "强";
  }

  const phone = pickPhoneForTemplate(templateId, rng);

  let painCar = { id: "none", label: "无" };
  let painCarStyle = null;
  if (hasPainCar) {
    const painItems = painCarOptions.map((x) => ({ id: x.id, weight: x.weight, label: x.label }));
    const painPickId = weightedPick(painItems, rng);
    const painPicked = painItems.find((x) => x.id === painPickId);
    painCar = { id: painPicked.id, label: painPicked.label };
    if (painCar.id !== "none") {
      painCarStyle = sampleWithoutReplacement(COSPLAY_POOL, 1, rng)[0];
    }
  }

  let wardrobeCosplays;
  if (painCarStyle) {
    const remaining = COSPLAY_POOL.filter((c) => c !== painCarStyle);
    wardrobeCosplays = [painCarStyle, ...sampleWithoutReplacement(remaining, wardrobeCosCount - 1, rng)];
  } else {
    wardrobeCosplays = sampleWithoutReplacement(COSPLAY_POOL, wardrobeCosCount, rng);
  }

  return {
    frozen: true,
    templateId,
    money,
    specialId,
    specialLabel,
    gender,
    phone: phone.id,
    phoneLabel: phone.label,
    wardrobeCosplays,
    painCarId: painCar.id,
    painCarLabel: painCar.label,
    painCarStyle,
  };
}

function pickPhoneForTemplate(templateId, rng) {
  const tempLabel = templateId === HIGH_SCHOOL_TEMPLATE ? "高中生" : templateId === COLLEGE_TEMPLATE ? "大学生" : "社畜";
  const items = PHONE_MODELS.filter((p) => p.template === tempLabel).map((p) => ({ id: p.id, weight: p.weight, label: p.label }));
  const pickId = weightedPick(items, rng);
  const picked = items.find((x) => x.id === pickId);
  return { id: picked.id, label: picked.label };
}

export function createRunStateFromRole(role) {
  return {
    roleTemplateId: role.templateId,
    money: role.money,
    gender: role.gender,
    specialId: role.specialId,

    phone: role.phone,
    phoneLabel: role.phoneLabel,

    wardrobeCosplays: [...role.wardrobeCosplays],
    backpackCosplays: [],
    backpackBadges: 0,

    painCarId: role.painCarId,
    painCarLabel: role.painCarLabel,
    painCarStyle: role.painCarStyle,

    travelMode: null,
    hotelId: null,

    makeupBookedTime: null,
    makeupDone: false,

    timeMinutes: null,
    recognition: null,

    energy: null,

    isTourist: false,

    flags: {
      easterHasPinUsed: false,
      easterZoomZoomUsed: false,
      noMakeupFirstUsed: false,
    },
  };
}

export function formatRoleText(state) {
  const role = state.role;
  if (!role) return "";
  if (state.genderSelect == null) {
    return ["性别：-", "金钱：-", "智能手机：-", "cosplay服装（衣柜）：-", "痛车：-", "痛车样式：-", "家长/公司强度：-"].join("\n");
  }
  const lines = [
    `性别：${role.gender === 0 ? "男性" : role.gender === 1 ? "女性" : "-"}`,
    `金钱：${role.money}`,
    `智能手机：${role.phoneLabel || "-"}`,
    `拥有的cosplay服装：${role.wardrobeCosplays.join("，") || "-"}`,
    `痛车：${role.painCarLabel || "-"}`,
    `痛车样式：${role.painCarStyle || "-"}`,
    `家长/公司强度：${role.specialLabel || "-"}`,
  ];
  return lines.join("\n");
}

export function registerDefaultHooks() {
  registerAchievementHook("subway_not_man_woman_explain", "super_brave");
  registerAchievementHook("subway_man_flirt_refuse", "heroine");
  registerAchievementHook("ex_pixel_easter", "pixel");
  registerAchievementHook("ex_zoom_zoom", "mazda");
}
