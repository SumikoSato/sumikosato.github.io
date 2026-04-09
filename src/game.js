import { bindUI, render, setModal } from "./ui.js";
import { clearGame, loadGame, saveGame } from "./storage.js";
import {
  COSPLAY_POOL,
  COLLEGE_TEMPLATE,
  ENDINGS,
  GAME_VERSION,
  HIGH_SCHOOL_TEMPLATE,
  OFFICE_TEMPLATE,
  PAIN_CAR_MODELS_OFFICE,
  PAIN_CAR_MODELS_UNIVERSITY,
  PHONE_MODELS,
  getHotelEnergyDelta,
} from "./storyData.js";
import { clamp, formatTimeHHMM, randInt, weightedPick } from "./utils.js";

function clamp01to100(n) {
  return clamp(n, 0, 100);
}

function requireMoneyOrModal(state, cost) {
  const money = state?.run?.money ?? 0;
  if (money >= cost) return true;
  setModal(true, { title: "提示", body: "金钱不足", confirmLabel: "确认" });
  return false;
}

function createDefaultState() {
  return {
    gameVersion: GAME_VERSION,
    screen: "mainMenu",
    nodeId: null,
    phaseId: null,
    nodeTitle: "",
    nodeText: "",
    choices: [],
    select: null,
    energy: null, // not active until D-1
    recognition: null, // set at OnlyWelcome
    timeMinutes: null, // exhibition time (10:00-18:00), minutes from 00:00
    rngSeed: null, // optional (not persisted now)

    role: null, // frozen role selection result
    run: null, // mutable run state (persisted)
  };
}

function isHighSchool(role) {
  return role?.templateId === HIGH_SCHOOL_TEMPLATE;
}
function isCollege(role) {
  return role?.templateId === COLLEGE_TEMPLATE;
}
function isOffice(role) {
  return role?.templateId === OFFICE_TEMPLATE;
}

function specialProbForParent(specialId) {
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

function hungerClamp(n) {
  return clamp(n, 0, 999999);
}

function pickPhoneForTemplate(templateId, rng) {
  const tempLabel = templateId === HIGH_SCHOOL_TEMPLATE ? "高中生" : templateId === COLLEGE_TEMPLATE ? "大学生" : "社畜";
  const items = PHONE_MODELS.filter((p) => p.template === tempLabel).map((p) => ({ id: p.id, weight: p.weight, label: p.label }));
  const pickId = weightedPick(items, rng);
  const picked = items.find((x) => x.id === pickId);
  return { id: picked.id, label: picked.label };
}

function sampleWithoutReplacement(pool, count, rng) {
  const arr = [...pool];
  // Fisher-Yates shuffle partial
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function createRoleSelection(rng = Math.random) {
  // Template等概率（用户未给出权重）
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

  const gender = weightedPick(
    [
      { id: 0, weight: 1 },
      { id: 1, weight: 1 },
    ],
    rng,
  );

  // Special numeric only exists for 高中生（家长严格度）与社畜（公司内卷度）
  let specialId = "none";
  let specialLabel = "-";
  if (templateId === HIGH_SCHOOL_TEMPLATE || templateId === OFFICE_TEMPLATE) {
    const specialLevels = ["none", "mid", "strong"];
    specialId = specialLevels[randInt(rng, 0, 2)];
    specialLabel = specialId === "none" ? "无" : specialId === "mid" ? "中" : "强";
  }

  // Draw order (spec): cosplay服装 -> 智能手机 -> 痛车 -> 痛车样式
  const wardrobeCosplays = sampleWithoutReplacement(COSPLAY_POOL, wardrobeCosCount, rng);
  const phone = pickPhoneForTemplate(templateId, rng);

  let painCar = { id: "none", label: "无" };
  let painCarStyle = null;
  if (hasPainCar) {
    const painItems = painCarOptions.map((x) => ({ id: x.id, weight: x.weight, label: x.label }));
    const painPickId = weightedPick(painItems, rng);
    const painPicked = painItems.find((x) => x.id === painPickId);
    painCar = { id: painPicked.id, label: painPicked.label };
    painCarStyle = sampleWithoutReplacement(COSPLAY_POOL, 1, rng)[0];
    if (painCar.id === "none") {
      painCarStyle = null;
    }
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

function createRunStateFromRole(role) {
  return {
    // persistable
    roleTemplateId: role.templateId,
    money: role.money,
    gender: role.gender,
    specialId: role.specialId,

    phone: role.phone,
    phoneLabel: role.phoneLabel,

    wardrobeCosplays: [...role.wardrobeCosplays], // array of cosplay ids
    backpackCosplays: [],
    backpackBadges: 0,

    painCarId: role.painCarId,
    painCarLabel: role.painCarLabel,
    painCarStyle: role.painCarStyle,

    travelMode: null, // "selfDrive" | "hardSeat" | "highSpeedRail" | "flight"
    hotelId: null, // "RuSiHaoWeiDeng" | ...

    makeupBookedTime: null, // 7/8/9/10
    makeupDone: false,

    // exhibition time + event flags
    timeMinutes: null,
    recognition: null,

    energy: null,

    // first-trigger flags
    flags: {
      easterHasPinUsed: false, // 有品！
      easterZoomZoomUsed: false, // Zoom-Zoom
      noMakeupFirstUsed: false, // 没化妆......第一次
    },
  };
}

function formatRoleText(state) {
  const role = state.role;
  if (!role) return "";
  const lines = [
    `金钱：${role.money}`,
    `性别：${role.gender === 0 ? "男性" : "女性"}`,
    `智能手机：${role.phoneLabel || "-"}`,
    `cosplay服装（衣柜）：${role.wardrobeCosplays.join("，") || "-"}`,
    `痛车：${role.painCarLabel || "-"}`,
    `痛车样式：${role.painCarStyle || "-"}`,
    `家长/公司强度：${role.specialLabel || "-"}`,
  ];
  return lines.join("\n");
}

function formatText(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars?.[k] ?? ""));
}

function isPhonePixel(state) {
  return String(state.run?.phoneLabel || "").includes("Pixel");
}

function isPainCarMazda(state) {
  // Based on spec: Zoom-Zoom only if car model is Mazda (any Mazda in provided lists)
  return String(state.run?.painCarLabel || "").includes("马自达");
}

function hasBackpackCosplay(state) {
  return (state.run?.backpackCosplays || []).length >= 1;
}

function getAnyBackpackCosplay(state) {
  const list = state.run?.backpackCosplays || [];
  return list[0] || null;
}

function getCosplayFromBackpackOrPlaceholder(state, placeholder = "-") {
  return getAnyBackpackCosplay(state) || placeholder;
}

function checkAndEndNoOneLikesMeIfNeeded(state) {
  if (state.run?.recognition != null && state.run.recognition <= 0) {
    setEnding(state, "noOneLikesMe");
    return true;
  }
  return false;
}

function checkAndEndLoveYourselfIfNeeded(state) {
  if (state.run?.energy != null && state.run.energy <= 0) {
    setEnding(state, "loveYourself");
    return true;
  }
  return false;
}

function setEnding(state, endingKey) {
  const ending = ENDINGS[endingKey];
  state.screen = "ending";
  state.nodeId = null;
  state.phaseId = null;
  state.nodeTitle = ending?.name || "结局";
  state.nodeText = ending?.text || "";
  state.choices = [];
  state.select = null;
  state.endingName = ending?.name;
  state.endingText = ending?.text;
  // Stop saving? still save last state
  saveGame(state);
  render(state);
}

function updateHudText(state) {
  if (state.run) {
    state.energy = state.run.energy;
    state.recognition = state.run.recognition;
  }
}

function setGameNode(state, { nodeId, title, text, choices, select } = {}) {
  state.screen = "game";
  state.nodeId = nodeId;
  state.nodeTitle = title || "";
  state.nodeText = text || "";
  state.choices = choices || [];
  state.select = select || null;
  updateHudText(state);
  saveGame(state);
  render(state);
}

function enterPhaseD30(state) {
  state.phaseId = "D-30";
  // Parent gate only for high school template
  if (isHighSchool(state.role) && state.run?.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setGameNodeParentCaughtEnding(state);
  }
  // else go to "好想去马娘Only"
  return enterNodeGoodWant(state);
}

function setGameNodeParentCaughtEnding(state) {
  setEnding(state, "hopeMature");
}

function enterNodeGoodWant(state) {
  return setGameNode(state, {
    nodeId: "good_want_enzao_gate",
    title: "好想去马娘Only",
    text:
      "这是一个晚上，你在QQ空间看见了列表在某地马娘Only玩得很开心，而你只是一个县城的coser，你知道这种盛大的且好玩的展会，与你这个身在小县城的人无关。\n直到你刷到了下一条说说，标题是：\n省城马娘Only 7/16 正式开展！\n你意识到省会好像离自己很近，于是加入了他们的群。而你看了看钱包和时间，你不知道自己真的能去到那里，和网上那些光鲜亮丽的coser一起玩。",
    choices: [
      { choiceId: "choice_good_want_go", label: "去！", primary: true },
      { choiceId: "choice_good_want_skip", label: "还是算了......" },
    ],
  });
}

function enterShopEnzao(state) {
  state.phaseId = "shop_enzao";
  return setGameNode(state, {
    nodeId: "shop_enzao",
    title: "嗯造工坊",
    text:
      "欢迎来到嗯造工坊，你可以在这里定制各种文创产品，只是交期我们从来都不敢向您保证......",
    choices: [
      { choiceId: "shop_enzao_buy_badges", label: "购买徽章*10（金钱-50）", primary: true },
      { choiceId: "shop_enzao_skip", label: "还是算了" },
    ],
  });
}

function enterPhaseD14(state) {
  state.phaseId = "D-14";
  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setGameNodeParentCaughtEnding(state);
  }

  return setGameNode(state, {
    nodeId: "event_role_choice",
    title: "要出什么角色呢......?",
    text:
      "你看着那些出着手游新实装角色的决胜服，很好看，虽然你的手里的确有cos服，但因为是出过的，你总希望去这种新场合的时候要有一身新行头。",
    choices: [
      { choiceId: "choice_role_buy", label: "买套新的", primary: true },
      { choiceId: "choice_role_skip", label: "还是算了" },
    ],
  });
}

function enterShopTaobao(state) {
  return setGameNode(state, {
    nodeId: "shop_taobao",
    title: "掏宝商城",
    text:
      "欢迎来到掏宝商城，这里你能买到各种各样的cos服，种类齐全，价格实惠。",
    choices: [
      { choiceId: "buy_cos_kes", label: "购买凯斯奇迹cos服*1（金钱-500）", primary: true },
      { choiceId: "buy_cos_zhongshan", label: "购买中山庆典cos服*1（金钱-500）" },
      { choiceId: "buy_cos_tokai", label: "购买东海帝皇cos服*1（金钱-500）" },
      { choiceId: "buy_cos_love", label: "购买爱如往昔cos服*1（金钱-500）" },
      { choiceId: "shop_taobao_skip", label: "还是算了" },
    ],
  });
}

function enterPhaseD10(state) {
  state.phaseId = "D-10";
  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setGameNodeParentCaughtEnding(state);
  }

  return setGameNode(state, {
    nodeId: "event_makeup_choice",
    title: "要约化妆师吗",
    text:
      "距离马O还剩下10天，你发现你需要一个化妆师（当然，群里管这个叫妆娘），虽然约妆的确是有点花钱，但是实际上，如果不化妆的话，除非你是那种超级好看的，否则还是很容易被人头套扯一地。",
    choices: [
      { choiceId: "choice_makeup_yes", label: "去约妆", primary: true },
      { choiceId: "choice_makeup_no", label: "还是算了" },
    ],
  });
}

function enterShopMakeup(state) {
  return setGameNode(state, {
    nodeId: "shop_makeup",
    title: "约妆",
    text: "宝子们快来找我约妆呀~",
    choices: [
      { choiceId: "makeup_7", label: "预约当天7点的化妆（金钱-40）", primary: true },
      { choiceId: "makeup_8", label: "预约当天8点的化妆（金钱-50）" },
      { choiceId: "makeup_9", label: "预约当天9点的化妆（金钱-60）" },
      { choiceId: "makeup_10", label: "预约当天10点的化妆（金钱-80）" },
      { choiceId: "shop_makeup_skip", label: "还是算了" },
    ],
  });
}

function enterPhaseD7(state) {
  state.phaseId = "D-7";
  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setGameNodeParentCaughtEnding(state);
  }

  const hasPainCar = state.run.painCarId && state.run.painCarId !== "none";

  if (hasPainCar) {
    return setGameNode(state, {
      nodeId: "event_paincar_open",
      title: "开痛车去吗",
      text: `距离马O还剩下7天，你需要考虑一下你的出行方式。相比其他爱好者来讲，你很幸运有一辆（${state.run.painCarLabel}）的（${state.run.painCarStyle}）痛车，你在思考要不要把车开过去。`,
      choices: [
        { choiceId: "paincar_open", label: "开！（需要燃油费-200）", primary: true },
        { choiceId: "paincar_close", label: "不开！" },
      ],
    });
  }
  return enterNodeTravelMode(state);
}

function enterNodeTravelMode(state) {
  return setGameNode(state, {
    nodeId: "event_travel_mode",
    title: "出行方式",
    text:
      "距离马O还剩下7天，你需要考虑一下你的出行方式。\n先打开不顺路出行App看看票吧。",
    choices: [
      { choiceId: "travel_open_app", label: "打开不顺路出行App", primary: true },
      { choiceId: "travel_too_expensive", label: "好贵，还是算了" },
    ],
  });
}

function enterShopNotShunLu(state) {
  return setGameNode(state, {
    nodeId: "shop_not_shunlu",
    title: "不顺路出行",
    text:
      "欢迎来到不顺路出行，我们可以预约各种各样的交通方式，包给您添堵的。",
    choices: [
      { choiceId: "ticket_highspeed", label: "购买高铁票*1（金钱-200）", primary: true },
      { choiceId: "ticket_flight", label: "购买飞机票*1（金钱-500）" },
      { choiceId: "ticket_hardseat", label: "购买硬座票*1（金钱-50）" },
      { choiceId: "ticket_skip", label: "还是算了" },
    ],
  });
}

function enterPhaseD5(state) {
  state.phaseId = "D-5";
  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setGameNodeParentCaughtEnding(state);
  }
  return setGameNode(state, {
    nodeId: "event_hotel_choice",
    title: "该住哪里",
    text: "距离马O还剩下5天，你需要考虑一下你到了那边该住哪里，总不能睡大街吧？",
    choices: [
      { choiceId: "hotel_open_app", label: "打开不去哪儿网App", primary: true },
      { choiceId: "hotel_too_expensive", label: "好贵，还是算了" },
    ],
  });
}

function enterShopGoWhere(state) {
  return setGameNode(state, {
    nodeId: "shop_bu_qu_nar",
    title: "不去哪儿网",
    text:
      "欢迎来到不去哪儿网，我们可以预订从低端到高端各种各样的酒店，至于售后和客服？不存在的！",
    choices: [
      { choiceId: "hotel_huaJiao", label: "预定花椒酒店（金钱-80）", primary: true },
      { choiceId: "hotel_ruLai", label: "预定如来精选（金钱-100）" },
      { choiceId: "hotel_huaTing", label: "预定华庭4.0（金钱-200）" },
      { choiceId: "hotel_ruSi", label: "预定瑞思豪威登（金钱-500）" },
      { choiceId: "hotel_skip", label: "还是算了" },
    ],
  });
}

function enterPhaseD3(state) {
  state.phaseId = "D-3";
  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setGameNodeParentCaughtEnding(state);
  }

  const wardrobe = state.run.wardrobeCosplays || [];
  const options = wardrobe.map((id) => ({ value: id, label: String(id) }));

  return setGameNode(state, {
    nodeId: "event_prep",
    title: "展前准备",
    text:
      "马上就要出发了，是出很美丽的cos，还是只是做一个普通游客呢？\n下拉菜单中选择你已经拥有的cos。",
    select: {
      label: "选择cos服",
      options: options.length ? options : [{ value: "", label: "（无可选cos）" }],
    },
    choices: [
      { choiceId: "prep_pick", label: "就决定是你了！", primary: true },
      { choiceId: "prep_skip", label: "还是算了" },
    ],
  });
}

function enterPhaseD1(state) {
  state.phaseId = "D-1";
  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setGameNodeParentCaughtEnding(state);
  }

  state.run.energy = 100;
  state.energy = 100;
  // travel energy deduction
  const mode = state.run.travelMode;
  const delta =
    mode === "selfDrive" ? -30 : mode === "hardSeat" ? -60 : mode === "highSpeedRail" ? -30 : mode === "flight" ? -20 : 0;
  state.run.energy = clamp01to100(state.run.energy + delta);
  updateHudText(state);
  if (checkAndEndLoveYourselfIfNeeded(state)) return;

  // enter travel
  setGameNode(state, {
    nodeId: "event_to_venue",
    title: "马O途中",
    text:
      `你通过${modeLabel(mode)}，经过了几个小时的路程之后，终于到达了省城。\n看着省城里的高楼大厦，你很感慨。你也梦想着有朝一日，能够在这样的大城市里生活。`,
    choices: [{ choiceId: "to_venue_arrive", label: "到达目的地", primary: true }],
  });
}

function modeLabel(mode) {
  if (mode === "selfDrive") return "自驾";
  if (mode === "hardSeat") return "硬座";
  if (mode === "highSpeedRail") return "高铁";
  if (mode === "flight") return "飞机";
  return "未知交通";
}

function enterEventDinner(state) {
  return setGameNode(state, {
    nodeId: "event_dinner",
    title: "晚餐时间",
    text:
      "你终于到了省城，舟车劳顿之后你感到很饿。\n掏出手机，你打开「饱了吗」App，发现这里的饭菜远比那个小县城里要丰富上数倍。",
    choices: [
      { choiceId: "dinner_barbeque", label: "用饱了吗App点餐：自助烤肉（精力+40，金钱-80）", primary: true },
      { choiceId: "dinner_mcn", label: "用饱了吗App点餐：麦肯王（精力+20，金钱-40）" },
      { choiceId: "dinner_mala", label: "用饱了吗App点餐：张福麻辣烫（精力+10，金钱-20）" },
      { choiceId: "dinner_skip", label: "好贵，还是算了（精力-20）" },
    ],
  });
}

function enterEventHotel(state) {
  const hotelId = state.run.hotelId;
  return setGameNode(state, {
    nodeId: "event_hotel",
    title: "入住酒店",
    text:
      `吃过晚饭，你入住了${hotelIdLabel(hotelId)}。你放下背包，简单洗了个澡，准备睡觉。\n你此刻感觉充满了信心。`,
    choices: [{ choiceId: "hotel_next_day", label: "迎接第二天", primary: true }],
  });
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

function enterPhaseMorning(state) {
  state.phaseId = "那一天的早上";
  // Parent check
  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setGameNodeParentCaughtEnding(state);
  }
  // Company check
  if (isOffice(state.role) && state.run.specialId !== "none") {
    const p = specialProbForOffice(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setEnding(state, "workWhy");
  }

  const hasCos = state.run.backpackCosplays.length > 0;
  const hasMakeupBooked = !!state.run.makeupBookedTime;

  const choices = [];
  if (!hasCos && !hasMakeupBooked) {
    choices.push({ choiceId: "morning_direct", label: "直接出发", primary: true });
  }
  if (hasCos && !hasMakeupBooked) {
    choices.push({ choiceId: "morning_prepare", label: "换上cos服，准备出发", primary: true });
  }
  if (hasCos && hasMakeupBooked) {
    choices.push({ choiceId: "morning_makeup", label: "换上cos服，前往化妆", primary: true });
  }

  if (!choices.length) {
    choices.push({ choiceId: "morning_direct_fallback", label: "直接出发", primary: true });
  }

  return setGameNode(state, {
    nodeId: "event_morning",
    title: "那一天的早上",
    text:
      "早上起来，你看着楼下三三两两地出现了一些coser，你很开心，你也想加入他们，可你和他们......真的很熟吗？",
    choices,
  });
}

function enterEventToMakeup(state) {
  return setGameNode(state, {
    nodeId: "event_go_makeup",
    title: "前往化妆",
    text: "你来到化妆师所在的地方，这是你第一次被别人化妆，你感觉是很新奇的体验。",
    choices: [{ choiceId: "makeup_done", label: "化妆完成，准备出发", primary: true }],
  });
}

function getMakeupEnergyDelta(bookedTime) {
  return bookedTime === 7 ? -30 : bookedTime === 8 ? -15 : bookedTime === 9 ? -10 : 0;
}

function enterEventAfterMakeup(state) {
  const bookedTime = state.run.makeupBookedTime;
  const energyDelta = getMakeupEnergyDelta(bookedTime);
  const energyText =
    energyDelta === 0 ? "你的精力值没有变化。" : `你的精力值${energyDelta}。`;

  return setGameNode(state, {
    nodeId: "event_after_makeup",
    title: "化妆完成",
    text:
      `化妆结束后，你看着镜子里的自己，心情复杂又有点兴奋。\n你预约的是当天${bookedTime}:00的化妆，整个化妆过程花费了1个小时。${energyText}`,
    choices: [{ choiceId: "after_makeup_depart", label: "准备出发", primary: true }],
  });
}

function applyMakeupEnergyAndTime(state) {
  const time = state.run.makeupBookedTime;
  // Spec: energy deduction based on makeup time
  const energyDelta = getMakeupEnergyDelta(time);
  state.run.energy = clamp01to100((state.run.energy ?? 0) + energyDelta);
  // Makeup takes 1 hour
  state.run.timeMinutes = time * 60 + 60;
  state.run.makeupDone = true;
  // Clear booking? keep it for record; not required for logic.
}

function enterPhaseSubway(state) {
  state.phaseId = "在地铁上";

  // If time is not set yet (direct/prepare), set baseline 9:00 by default.
  if (state.run.timeMinutes == null) state.run.timeMinutes = 9 * 60;

  // Parent check
  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setEnding(state, "hopeMature");
  }

  // Company check
  if (isOffice(state.role) && state.run.specialId !== "none") {
    const p = specialProbForOffice(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setEnding(state, "workWhy");
  }

  // Gender event:
  // user clarified apply10_then_50: first 10% decide whether any gender event happens;
  // if triggered then 50% pick the corresponding event, otherwise 风平浪静.
  const gender = state.run.gender;
  const trigger10 = Math.random() < 0.1;
  let nextNode = "wind";
  if (trigger10) {
    if (gender === 0) {
      nextNode = Math.random() < 0.5 ? "not_man_woman" : "wind";
    } else {
      nextNode = Math.random() < 0.5 ? "man_encounter" : "wind";
    }
  }

  if (nextNode === "not_man_woman") return enterEventNotManWoman(state);
  if (nextNode === "man_encounter") return enterEventManFlirt(state);
  return enterEventWind(state);
}

function enterEventNotManWoman(state) {
  return setGameNode(state, {
    nodeId: "event_not_man_woman",
    title: "不男不女",
    text:
      `你穿着赛马娘的cos服，这时一个看起来不怀好意的老大爷走过来，突然指着你，质问你「男的女的？穿这种日本动漫的衣服干什么？你是什么目的？」`,
    choices: [
      {
        choiceId: "not_man_woman_ignore",
        label: "不予理会（精力值-10）",
        primary: true,
      },
      {
        choiceId: "not_man_woman_explain",
        label: "试图说明（？？？）",
      },
    ],
  });
}

function enterEventManFlirt(state) {
  return setGameNode(state, {
    nodeId: "event_man_flirt",
    title: "被男性搭讪",
    text:
      "你穿着赛马娘的cos服，这时一个看起来不怀好意的男子走过来，贴近了你的身体，问你「小姐姐是不是玩cos的？加个好友，能处对象吗？」",
    choices: [
      {
        choiceId: "man_flirt_ignore",
        label: "不予理会（精力值-10）",
        primary: true,
      },
      {
        choiceId: "man_flirt_refuse",
        label: "试图拒绝（？？？）",
      },
    ],
  });
}

function enterEventWind(state) {
  return setGameNode(state, {
    nodeId: "event_wind",
    title: "风平浪静",
    text: "你穿着cos服，在地铁上很幸运地没有受到异样的眼光，安全抵达了现场。",
    choices: [{ choiceId: "wind_get_off", label: "下车", primary: true }],
  });
}

function enterPhaseOnlyWelcome(state) {
  state.phaseId = "欢迎来到马娘Only";

  if (state.run.recognition == null) {
    state.run.recognition = 50;
  }
  updateHudText(state);

  // Parent check
  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setEnding(state, "hopeMature");
    // If not hit, wait 1 hour then recheck
    if (state.run.timeMinutes != null) state.run.timeMinutes += 60;
    const hit2 = Math.random() < p;
    if (hit2) return setEnding(state, "hopeMature");
  }

  // Company check
  if (isOffice(state.role) && state.run.specialId !== "none") {
    const p = specialProbForOffice(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setEnding(state, "workWhy");
    if (state.run.timeMinutes != null) state.run.timeMinutes += 60;
    const hit2 = Math.random() < p;
    if (hit2) return setEnding(state, "workWhy");
  }

  if (state.run.timeMinutes < 10 * 60) {
    return setGameNode(state, {
      nodeId: "node_wait",
      title: "稍作等待",
      text: `现在时间是${formatTimeHHMM(state.run.timeMinutes)}，你决定稍作等待，等到10点准时进入。`,
      choices: [{ choiceId: "wait_set_10", label: "继续", primary: true }],
    });
  }

  return enterExhibitionEvent(state);
}

function enterExhibitionEvent(state) {
  // if time reached 18:00 -> after event
  if (state.run.timeMinutes >= 18 * 60) {
    return enterPhaseAfterOnly(state);
  }

  const eventId = weightedPick(
    [
      { id: "wind", weight: 2 },
      { id: "post", weight: 55 },
      { id: "great_creator", weight: 10 },
      { id: "stage_program", weight: 10 },
      { id: "expansion", weight: 10 },
      { id: "paincar_approved", weight: 10 },
      { id: "no_makeup", weight: 1 },
      { id: "pixel_easter", weight: 1 },
      { id: "zoom_zoom", weight: 1 },
    ],
    Math.random,
  );

  // Resolve redirections
  const variant = resolveExhibitionEventVariant(state, eventId);
  return setGameNode(state, {
    nodeId: variant.nodeId,
    title: variant.title,
    text: formatText(variant.text, {
      cosplay: getCosplayFromBackpackOrPlaceholder(state, "（未知服装）"),
      painCarModel: state.run.painCarLabel,
      painCarStyle: state.run.painCarStyle,
    }),
    choices: variant.choices,
  });
}

function resolveExhibitionEventVariant(state, eventId) {
  const timeText = formatTimeHHMM(state.run.timeMinutes ?? 0);
  const backpackHasCos = hasBackpackCosplay(state);
  const hasPainCar = state.run.painCarId && state.run.painCarId !== "none";
  const selfDrive = state.run.travelMode === "selfDrive";

  const wind = {
    nodeId: "ex_wind",
    title: "风平浪静",
    text: "这段时间似乎什么都没发生，你选择继续游场。",
    choices: [
      { choiceId: "ex_wind_continue", label: "继续游场（认可度-5）", primary: true },
    ],
  };

  if (eventId === "wind") return wind;

  if (eventId === "post") {
    if (!backpackHasCos) {
      return {
        nodeId: "ex_teacher_post_cond",
        title: "可以和老师集邮吗？",
        text: "你看到了一个coser，觉得他很好看，你想要和他合影。",
        choices: [
          { choiceId: "ex_post2_btn1", label: "合影并递上周边（认可度+5，周边数量-1）", primary: true, requiresBadges: 1 },
          { choiceId: "ex_post2_btn2", label: "合影（认可度+1）" },
          { choiceId: "ex_post2_btn3", label: "还是不了（认可度-5）" },
        ],
      };
    }
    return {
      nodeId: "ex_post",
      title: "被集邮了！",
      text: `有人觉得你cos的{{cosplay}}很好看，他想要和你合影。`,
      choices: [
        { choiceId: "ex_post_btn1", label: "合影并递上周边（认可度+10，周边数量-1）", primary: true, requiresBadges: 1 },
        { choiceId: "ex_post_btn2", label: "合影（认可度+5）" },
        { choiceId: "ex_post_btn3", label: "还是不了（认可度-5）" },
      ],
    };
  }

  if (eventId === "great_creator") {
    return {
      nodeId: "ex_great_creator",
      title: "很棒的同人老师",
      text: "你遇到了一个你十分喜欢的同人摊位，角色和风格都很戳你，这让你想要购买。",
      choices: [
        { choiceId: "ex_great_btn1", label: "立即购买（认可度+10，金钱-20）", primary: true },
        { choiceId: "ex_great_btn2", label: "还是不了" },
      ],
    };
  }

  if (eventId === "stage_program") {
    return {
      nodeId: "ex_stage_program",
      title: "喜欢的舞台节目",
      text: "你看到了非常喜欢的舞台节目，他的舞姿如此有张力，以至于你感到精神都升华到了新的境界。",
      choices: [{ choiceId: "ex_stage_btn1", label: "きみの愛馬が!", primary: true }],
    };
  }

  if (eventId === "expansion") {
    return {
      nodeId: "ex_expansion",
      title: "扩列了！",
      text: "你遇到了一位同人作者，她递给你一份无料，其中的自我介绍，你觉得这是一个很有态度的人......",
      choices: [
        { choiceId: "ex_expansion_btn1", label: "加好友并交换周边（认可度+10，周边数量-1）", primary: true, requiresBadges: 1 },
        { choiceId: "ex_expansion_btn2", label: "还是不了（认可度-5）" },
      ],
    };
  }

  if (eventId === "paincar_approved") {
    if (!selfDrive) {
      return {
        nodeId: "ex_paincar_unapproved",
        title: "这车真帅吧",
        text:
          "你看到了一辆奥迪S4的凯斯奇迹痛车，非常喜欢。你对车主表达了赞叹，并想要拍一张照片。",
        choices: [
          { choiceId: "ex_pain_btn1", label: "拍照并递上周边（认可度+5，周边数量-1）", primary: true, requiresBadges: 1 },
          { choiceId: "ex_pain_btn2", label: "拍照（认可度+1）" },
          { choiceId: "ex_pain_btn3", label: "还是不了（认可度-5）" },
        ],
      };
    }
    // self drive: show paincar approved event (text uses placeholders)
    return {
      nodeId: "ex_paincar_approved",
      title: "痛车得到认可",
      text: `你的{{painCarModel}}的{{painCarStyle}}痛车得到了极大的认可，有coser和你的痛车合影，而且还大赞你的痛车十分有品。`,
      choices: [{ choiceId: "ex_pain_approved_btn1", label: "感谢他（认可度+10）", primary: true }],
    };
  }

  if (eventId === "no_makeup") {
    const cosInBackpack = backpackHasCos;
    const makeupDone = !!state.run.makeupDone;
    const first = !state.run.flags.noMakeupFirstUsed;

    // Spec priority:
    // - cosplay & makeup都否 => 风平浪静
    // - cosplay与化妆都在 => 奇怪的眼神（不受“第一次触发”影响）
    // - 只有cos在、化妆不在：只有“第一次触发”才触发没化妆......，否则仍是风平浪静
    if (!cosInBackpack && !makeupDone) {
      return wind;
    }

    if (cosInBackpack && makeupDone) {
      return {
        nodeId: "ex_wrong_eyes",
        title: "奇怪的眼神",
        text: `有人觉得你cos的{{cosplay}}不还原，和同伴小声嘀咕，意图将你挂到网上。`,
        choices: [
          { choiceId: "ex_wrong_btn1", label: "阻止", primary: true },
          { choiceId: "ex_wrong_btn2", label: "不阻止（认可度-40）" },
        ],
      };
    }

    if (cosInBackpack && !makeupDone) {
      if (!first) return wind;
      state.run.flags.noMakeupFirstUsed = true;
      return {
        nodeId: "ex_no_makeup",
        title: "没化妆......",
        text: "有人发现你没化妆，于是他当场指责你，说你毁了他推的形象，他很生气，甚至马上要把你的假发扒下来。",
        choices: [
          { choiceId: "ex_no_makeup_btn1", label: "跑！（认可度-50）", primary: true },
          { choiceId: "ex_no_makeup_btn2", label: "不跑" },
        ],
      };
    }

    return wind;
  }

  if (eventId === "pixel_easter") {
    const good = isPhonePixel(state);
    if (!good || state.run.flags.easterHasPinUsed) return wind;
    state.run.flags.easterHasPinUsed = true;
    return {
      nodeId: "ex_has_pin",
      title: "有品！",
      text: "有人看到了你用Pixel手机，感觉你十分有品。想要和你扩列。",
      choices: [
        { choiceId: "ex_has_pin_btn1", label: "加好友并交换周边（认可度+50，周边数量-1）", primary: true, requiresBadges: 1 },
        { choiceId: "ex_has_pin_btn2", label: "还是不了" },
      ],
    };
  }

  if (eventId === "zoom_zoom") {
    const ok = isPainCarMazda(state) && state.run.travelMode === "selfDrive";
    if (!ok || state.run.flags.easterZoomZoomUsed) return wind;
    state.run.flags.easterZoomZoomUsed = true;
    return {
      nodeId: "ex_zoom_zoom",
      title: "Zoom-Zoom",
      text: "有人看到了你{{painCarModel}}的{{painCarStyle}}痛车，对方恰好也是个马自达车主，想要和你扩列。",
      choices: [
        { choiceId: "ex_zoom_btn1", label: "加好友并交换周边（认可度+50，周边数量-1）", primary: true, requiresBadges: 1 },
        { choiceId: "ex_zoom_btn2", label: "还是不了" },
      ],
    };
  }

  return wind;
}

function enterPhaseAfterOnly(state) {
  state.phaseId = "马O之后";

  if (isHighSchool(state.role) && state.run.specialId !== "none") {
    const p = specialProbForParent(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setEnding(state, "hopeMature");
  }
  if (isOffice(state.role) && state.run.specialId !== "none") {
    const p = specialProbForOffice(state.role.specialId);
    const hit = Math.random() < p;
    if (hit) return setEnding(state, "workWhy");
  }

  return setGameNode(state, {
    nodeId: "event_after_only_dinner",
    title: "要聚餐吗",
    text: "刚刚结束了的马娘Only，大家似乎意犹未尽，于是有人提议去聚餐。你刚刚认识的新朋友也要拉着你一起。",
    choices: [
      { choiceId: "after_dinner_yes", label: "去！（金钱-50，精力值+30，认可值+30）", primary: true },
      { choiceId: "after_dinner_no", label: "不去！" },
    ],
  });
}

function enterPhaseGoHome(state) {
  state.phaseId = "各回各家";

  const mode = state.run.travelMode;
  const delta =
    mode === "selfDrive" ? -30 : mode === "hardSeat" ? -60 : mode === "highSpeedRail" ? -30 : mode === "flight" ? -20 : 0;
  state.run.energy = clamp01to100((state.run.energy ?? 0) + delta);
  updateHudText(state);
  if (checkAndEndLoveYourselfIfNeeded(state)) return;

  return setGameNode(state, {
    nodeId: "event_go_home",
    title: "各回各家",
    text:
      `你通过${modeLabel(mode)}，经过了几个小时的路程之后，终于回到了小县城。\n回想着今天经历的一切，你的泪水慢慢地滑了出来。你不知道以后还有没有机会和他们见面。`,
    choices: [{ choiceId: "home_arrive_end", label: "到达目的地", primary: true }],
  });
}

function resolveEndByRecognition(state) {
  const r = state.run.recognition ?? 0;
  if (r <= 0) return setEnding(state, "noOneLikesMe");
  if (r >= 80) return setEnding(state, "superStar");
  if (r >= 50) return setEnding(state, "nextTime");
  if (r >= 20) return setEnding(state, "somewhatLost");
  return setEnding(state, "realSomeoneLikesYou");
}

function applyHotelEnergy(state) {
  const delta = getHotelEnergyDelta(state.run.hotelId);
  state.run.energy = clamp01to100((state.run.energy ?? 0) + delta);
}

function dispatch(actionId, ctx = {}) {
  const state = window.__maoState;
  if (!state) return;

  if (actionId === "modal_confirm") {
    setModal(false);
    return render(state);
  }

  if (actionId === "restart") {
    clearGame();
    window.__maoState = createDefaultState();
    bindUI({ onAction: dispatch });
    render(window.__maoState);
    return;
  }

  if (state.screen === "mainMenu") {
    if (actionId === "start_role_select") {
      state.screen = "roleSelect";
      state.role = createRoleSelection(Math.random);
      state.nodeId = null;
      state.nodeTitle = "";
      state.nodeText = "";
      state.choices = [];
      state.select = null;
      saveGame(state);
      render(state);
    }
    return;
  }

  if (state.screen === "roleSelect") {
    if (actionId === "roll_role" || actionId === "roll_role_again") {
      state.role = createRoleSelection(Math.random);
      saveGame(state);
      render(state);
    }
    if (actionId === "enter_game") {
      if (!state.role?.frozen) return;
      state.run = createRunStateFromRole(state.role);
      state.energy = null;
      state.recognition = null;
      state.timeMinutes = null;
      state.screen = "game";
      enterPhaseD30(state);
    }
    return;
  }

  if (state.screen === "ending") {
    return;
  }

  if (state.screen === "game") {
    // Handle based on nodeId
    switch (state.nodeId) {
      // Main gates
      case "good_want_enzao_gate":
        if (actionId === "choice_good_want_go") return enterShopEnzao(state);
        if (actionId === "choice_good_want_skip") return setEnding(state, "neverStartDream");
        break;

      case "shop_enzao":
        if (actionId === "shop_enzao_buy_badges") {
          if (!requireMoneyOrModal(state, 50)) return;
          state.run.backpackBadges += 10;
          state.run.money -= 50;
          return enterPhaseD14(state);
        }
        if (actionId === "shop_enzao_skip") return enterPhaseD14(state);
        break;

      case "event_role_choice":
        if (actionId === "choice_role_skip") return enterPhaseD10(state);
        if (actionId === "choice_role_buy") return enterShopTaobao(state);
        break;

      case "shop_taobao":
        if (actionId === "shop_taobao_skip") return enterPhaseD10(state);
        if (
          actionId === "buy_cos_kes" ||
          actionId === "buy_cos_zhongshan" ||
          actionId === "buy_cos_tokai" ||
          actionId === "buy_cos_love"
        ) {
          if (!requireMoneyOrModal(state, 500)) return;
        }
        if (actionId === "buy_cos_kes") state.run.wardrobeCosplays.push("凯斯奇迹");
        if (actionId === "buy_cos_zhongshan") state.run.wardrobeCosplays.push("中山庆典");
        if (actionId === "buy_cos_tokai") state.run.wardrobeCosplays.push("东海帝皇");
        if (actionId === "buy_cos_love") state.run.wardrobeCosplays.push("爱如往昔");
        if (
          actionId === "buy_cos_kes" ||
          actionId === "buy_cos_zhongshan" ||
          actionId === "buy_cos_tokai" ||
          actionId === "buy_cos_love"
        ) {
          state.run.money -= 500;
          return enterPhaseD10(state);
        }
        break;

      case "event_makeup_choice":
        if (actionId === "choice_makeup_no") return enterPhaseD7(state);
        if (actionId === "choice_makeup_yes") return enterShopMakeup(state);
        break;

      case "shop_makeup":
        if (actionId === "shop_makeup_skip") return enterPhaseD7(state);
        if (actionId === "makeup_7") {
          if (!requireMoneyOrModal(state, 40)) return;
          state.run.makeupBookedTime = 7;
          state.run.money -= 40;
          return enterPhaseD7(state);
        }
        if (actionId === "makeup_8") {
          if (!requireMoneyOrModal(state, 50)) return;
          state.run.makeupBookedTime = 8;
          state.run.money -= 50;
          return enterPhaseD7(state);
        }
        if (actionId === "makeup_9") {
          if (!requireMoneyOrModal(state, 60)) return;
          state.run.makeupBookedTime = 9;
          state.run.money -= 60;
          return enterPhaseD7(state);
        }
        if (actionId === "makeup_10") {
          if (!requireMoneyOrModal(state, 80)) return;
          state.run.makeupBookedTime = 10;
          state.run.money -= 80;
          return enterPhaseD7(state);
        }
        break;

      case "event_paincar_open":
        if (actionId === "paincar_open") {
          if (!requireMoneyOrModal(state, 200)) return;
          state.run.travelMode = "selfDrive";
          state.run.money -= 200;
          return enterPhaseD5(state);
        }
        if (actionId === "paincar_close") return enterNodeTravelMode(state);
        break;

      case "event_travel_mode":
        if (actionId === "travel_open_app") return enterShopNotShunLu(state);
        if (actionId === "travel_too_expensive") return setEnding(state, "neverStartDream");
        break;

      case "shop_not_shunlu":
        if (actionId === "ticket_skip") return setEnding(state, "neverStartDream");
        if (actionId === "ticket_highspeed") {
          if (!requireMoneyOrModal(state, 200)) return;
          state.run.travelMode = "highSpeedRail";
          state.run.money -= 200;
          return enterPhaseD5(state);
        }
        if (actionId === "ticket_flight") {
          if (!requireMoneyOrModal(state, 500)) return;
          state.run.travelMode = "flight";
          state.run.money -= 500;
          return enterPhaseD5(state);
        }
        if (actionId === "ticket_hardseat") {
          if (!requireMoneyOrModal(state, 50)) return;
          state.run.travelMode = "hardSeat";
          state.run.money -= 50;
          return enterPhaseD5(state);
        }
        break;

      case "event_hotel_choice":
        if (actionId === "hotel_open_app") return enterShopGoWhere(state);
        if (actionId === "hotel_too_expensive") return setEnding(state, "neverStartDream");
        break;

      case "shop_bu_qu_nar":
        if (actionId === "hotel_skip") return setEnding(state, "neverStartDream");
        if (actionId === "hotel_huaJiao") {
          if (!requireMoneyOrModal(state, 80)) return;
          state.run.hotelId = "HuaJiaoHotel";
          state.run.money -= 80;
          return enterPhaseD3(state);
        }
        if (actionId === "hotel_ruLai") {
          if (!requireMoneyOrModal(state, 100)) return;
          state.run.hotelId = "RuLaiJingXuan";
          state.run.money -= 100;
          return enterPhaseD3(state);
        }
        if (actionId === "hotel_huaTing") {
          if (!requireMoneyOrModal(state, 200)) return;
          state.run.hotelId = "HuaTing40";
          state.run.money -= 200;
          return enterPhaseD3(state);
        }
        if (actionId === "hotel_ruSi") {
          if (!requireMoneyOrModal(state, 500)) return;
          state.run.hotelId = "RuSiHaoWeiDeng";
          state.run.money -= 500;
          return enterPhaseD3(state);
        }
        break;

      case "event_prep": {
        if (actionId === "prep_skip") {
          if (state.run.makeupBookedTime == null) return enterPhaseD1(state);
          setModal(true, {
            title: "提醒",
            body: "可是你已经约了化妆师诶……",
            confirmLabel: "确认",
          });
          // keep node
          return;
        }

        if (actionId === "prep_pick") {
          const selected = ctx.selectedValue;
          if (!selected) return enterPhaseD1(state);
          // Move selected cosplay from wardrobe to backpack
          const idx = state.run.wardrobeCosplays.indexOf(selected);
          if (idx >= 0) {
            state.run.wardrobeCosplays.splice(idx, 1);
            state.run.backpackCosplays.push(selected);
          }
          return enterPhaseD1(state);
        }
        break;
      }

      case "event_to_venue":
        if (actionId === "to_venue_arrive") return enterEventDinner(state);
        break;

      case "event_dinner":
        if (actionId === "dinner_skip") {
          state.run.energy = clamp01to100((state.run.energy ?? 0) - 20);
          updateHudText(state);
          if (checkAndEndLoveYourselfIfNeeded(state)) return;
          return enterEventHotel(state);
        }
        if (actionId === "dinner_barbeque") {
          if (!requireMoneyOrModal(state, 80)) return;
          state.run.money -= 80;
          state.run.energy = clamp01to100((state.run.energy ?? 0) + 40);
          updateHudText(state);
          return enterEventHotel(state);
        }
        if (actionId === "dinner_mcn") {
          if (!requireMoneyOrModal(state, 40)) return;
          state.run.money -= 40;
          state.run.energy = clamp01to100((state.run.energy ?? 0) + 20);
          updateHudText(state);
          return enterEventHotel(state);
        }
        if (actionId === "dinner_mala") {
          if (!requireMoneyOrModal(state, 20)) return;
          state.run.money -= 20;
          state.run.energy = clamp01to100((state.run.energy ?? 0) + 10);
          updateHudText(state);
          return enterEventHotel(state);
        }
        break;

      case "event_hotel":
        if (actionId === "hotel_next_day") {
          applyHotelEnergy(state);
          updateHudText(state);
          if (checkAndEndLoveYourselfIfNeeded(state)) return;
          return enterPhaseMorning(state);
        }
        break;

      case "event_morning":
        if (actionId === "morning_direct" || actionId === "morning_direct_fallback") {
          state.run.timeMinutes = 9 * 60; // baseline
          return enterPhaseSubway(state);
        }
        if (actionId === "morning_prepare") {
          state.run.timeMinutes = 9 * 60;
          return enterPhaseSubway(state);
        }
        if (actionId === "morning_makeup") {
          return enterEventToMakeup(state);
        }
        break;

      case "event_go_makeup":
        if (actionId === "makeup_done") {
          applyMakeupEnergyAndTime(state);
          updateHudText(state);
          if (checkAndEndLoveYourselfIfNeeded(state)) return;
          return enterEventAfterMakeup(state);
        }
        break;

      case "event_after_makeup":
        if (actionId === "after_makeup_depart") {
          return enterPhaseSubway(state);
        }
        break;

      case "event_not_man_woman":
        if (actionId === "not_man_woman_ignore") {
          state.run.energy = clamp01to100((state.run.energy ?? 0) - 10);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndLoveYourselfIfNeeded(state)) return;
          return enterPhaseOnlyWelcome(state);
        }
        if (actionId === "not_man_woman_explain") {
          const hit = Math.random() < 0.5;
          if (hit) {
            return setGameNode(state, {
              nodeId: "event_do_whatever",
              title: "干什么！",
              text:
                "对方丝毫不理会你，甚至被你的行为激怒了，在一阵怒吼之后，他扑上来大喊「你是不是男的？是不是没长那玩意？我现在就把你的衣服扒下来！」，此时你意识到不对，凭借体力优势，将其控制在地上。这时，乘警来到了你的附近......",
              choices: [
                { choiceId: "do_whatever_help", label: "协助调查", primary: true },
              ],
            });
          }
          state.run.energy = clamp01to100((state.run.energy ?? 0) - 20);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndLoveYourselfIfNeeded(state)) return;
          return enterPhaseOnlyWelcome(state);
        }
        break;

      case "event_man_flirt":
        if (actionId === "man_flirt_ignore") {
          state.run.energy = clamp01to100((state.run.energy ?? 0) - 10);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndLoveYourselfIfNeeded(state)) return;
          return enterPhaseOnlyWelcome(state);
        }
        if (actionId === "man_flirt_refuse") {
          const hit = Math.random() < 0.5;
          if (hit) {
            return setGameNode(state, {
              nodeId: "event_brave_no",
              title: "勇敢说不",
              text:
                "对方丝毫不理会你，开始伸出手来，此时你意识到不对，因为学过跆拳道的原因，你成功将其控制在地上。这时，乘警来到了你的附近......",
              choices: [
                { choiceId: "brave_no_help", label: "协助调查", primary: true },
              ],
            });
          }
          state.run.energy = clamp01to100((state.run.energy ?? 0) - 20);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndLoveYourselfIfNeeded(state)) return;
          return enterPhaseOnlyWelcome(state);
        }
        break;

      case "event_do_whatever":
        if (actionId === "do_whatever_help") return setEnding(state, "selfDefense");
        break;

      case "event_brave_no":
        if (actionId === "brave_no_help") return setEnding(state, "braveGirl");
        break;

      case "event_wind":
        if (actionId === "wind_get_off") {
          state.run.timeMinutes += 30;
          updateHudText(state);
          return enterPhaseOnlyWelcome(state);
        }
        break;

      case "node_wait":
        if (actionId === "wait_set_10") {
          state.run.timeMinutes = 10 * 60;
          return enterExhibitionEvent(state);
        }
        break;

      // Exhibition events (return to OnlyWelcome)
      case "ex_wind":
        if (actionId === "ex_wind_continue") {
          state.run.recognition = clamp01to100(state.run.recognition - 5);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_post":
        if (actionId === "ex_post_btn1") {
          state.run.recognition = clamp01to100(state.run.recognition + 10);
          state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_post_btn2") {
          state.run.recognition = clamp01to100(state.run.recognition + 5);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_post_btn3") {
          state.run.recognition = clamp01to100(state.run.recognition - 5);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_teacher_post_cond":
        if (actionId === "ex_post2_btn1") {
          state.run.recognition = clamp01to100(state.run.recognition + 5);
          state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_post2_btn2") {
          state.run.recognition = clamp01to100(state.run.recognition + 1);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_post2_btn3") {
          state.run.recognition = clamp01to100(state.run.recognition - 5);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_great_creator":
        if (actionId === "ex_great_btn1") {
          if (!requireMoneyOrModal(state, 20)) return;
          state.run.recognition = clamp01to100(state.run.recognition + 10);
          state.run.money -= 20;
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_great_btn2") {
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_stage_program":
        if (actionId === "ex_stage_btn1") {
          state.run.energy = clamp01to100((state.run.energy ?? 0) + 10);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndLoveYourselfIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_expansion":
        if (actionId === "ex_expansion_btn1") {
          state.run.recognition = clamp01to100(state.run.recognition + 10);
          state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_expansion_btn2") {
          state.run.recognition = clamp01to100(state.run.recognition - 5);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_paincar_unapproved":
        if (actionId === "ex_pain_btn1") {
          state.run.recognition = clamp01to100(state.run.recognition + 5);
          state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_pain_btn2") {
          state.run.recognition = clamp01to100(state.run.recognition + 1);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_pain_btn3") {
          state.run.recognition = clamp01to100(state.run.recognition - 5);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_paincar_approved":
        if (actionId === "ex_pain_approved_btn1") {
          state.run.recognition = clamp01to100(state.run.recognition + 10);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_wrong_eyes":
        if (actionId === "ex_wrong_btn1") return setEnding(state, "onlineBully");
        if (actionId === "ex_wrong_btn2") {
          state.run.recognition = clamp01to100(state.run.recognition - 40);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_no_makeup":
        if (actionId === "ex_no_makeup_btn1") {
          state.run.recognition = clamp01to100(state.run.recognition - 50);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_no_makeup_btn2") return setEnding(state, "wigTorn");
        break;

      case "ex_has_pin":
        if (actionId === "ex_has_pin_btn1") {
          state.run.recognition = clamp01to100(state.run.recognition + 50);
          state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_has_pin_btn2") {
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      case "ex_zoom_zoom":
        if (actionId === "ex_zoom_btn1") {
          state.run.recognition = clamp01to100(state.run.recognition + 50);
          state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        if (actionId === "ex_zoom_btn2") {
          state.run.timeMinutes += 30;
          updateHudText(state);
          if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
          return enterExhibitionEvent(state);
        }
        break;

      // AfterOnly + GoHome
      case "event_after_only_dinner":
        if (actionId === "after_dinner_yes") {
          if (!requireMoneyOrModal(state, 50)) return;
          state.run.money -= 50;
          state.run.energy = clamp01to100((state.run.energy ?? 0) + 30);
          state.run.recognition = clamp01to100((state.run.recognition ?? 0) + 30);
          updateHudText(state);
          if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
          return enterPhaseGoHome(state);
        }
        if (actionId === "after_dinner_no") return enterPhaseGoHome(state);
        break;

      case "event_go_home":
        if (actionId === "home_arrive_end") {
          return resolveEndByRecognition(state);
        }
        break;
    }
  }
}

function init() {
  bindUI({ onAction: dispatch });
  let state = loadGame();
  if (!state) state = createDefaultState();

  // minimal migration / guards
  if (!state.screen) state = createDefaultState();
  window.__maoState = state;
  render(state);
}

// Patch: ensure dispatch uses updated state reference
// and fill missing functions for entering phases after initial state.
window.__maoDispatch = dispatch;

try {
  init();
} catch (e) {
  // Ensure the page is not totally blank on sync runtime errors.
  console.error("Fatal error:", e);
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML =
      "<div class='card' style='text-align:center;'>" +
      "<div class='title' style='font-size:20px;margin-top:0;'>游戏加载失败</div>" +
      "<div class='textBlock' style='opacity:0.95;'>" +
      String(e && (e.stack || e.message) ? e.stack || e.message : e) +
      "</div>" +
      "</div>";
  }
}

