import { bindUI, render, setModal } from "./ui.js";
import { clearGame, loadGame, saveGame, getSoundEnabled } from "./storage.js";
import { unlockAchievement } from "./achievements.js";
import {
  COMMON_ENDINGS,
  GAME_VERSION,
  UMA_BIRTHDAYS,
} from "./storyData.js";
import { applyTheme, getThemeId } from "./theme.js";

// ── Story engine integration ─────────────────────────────
import {
  enterNode,
  handleChoice,
  clamp01to100,
  registerEndings,
  registerAudioHook,
  getEnding,
  getAudioHook,
  getAchievementHook,
} from "./storyEngine.js";
import "./storyline_default.js"; // side-effect: registers all story nodes
import "./storyline_doujin.js";  // side-effect: registers doujin mode nodes

// ── Storyline interface — import from default storyline ──
import {
  DEFAULT_ENDINGS,
  HIGH_SCHOOL_TEMPLATE,
  COLLEGE_TEMPLATE,
  OFFICE_TEMPLATE,
  isHighSchool,
  isCollege,
  isOffice,
  specialProbForParent,
  createRoleSelection,
  createRunStateFromRole,
  formatRoleText,
  getFirstNodeId as defaultFirstNodeId,
  registerDefaultHooks,
} from "./storyline_default.js";

import { registerDoujinHooks, getFirstNodeId as doujinFirstNodeId } from "./storyline_doujin.js";

// ── Register endings & hooks ─────────────────────────────
registerEndings({ ...COMMON_ENDINGS, ...DEFAULT_ENDINGS });
registerDefaultHooks();
registerDoujinHooks();

// Register audio hooks (need access to playBgm / AUDIO_MAP in this module)
registerAudioHook("ex_zoom_zoom", () => playBgm(AUDIO_MAP.zoomZoom));
registerAudioHook("ex_stage_program", () => playBgm(AUDIO_MAP.umaTracks[Math.floor(Math.random() * AUDIO_MAP.umaTracks.length)]));

// ── Audio management ─────────────────────────────────
let currentBgm = null;
let currentBgmBlobUrl = null;
let currentSfx = null;
let currentSfxBlobUrl = null;

export async function playBgm(src) {
  stopBgm();
  if (!getSoundEnabled()) return;
  try {
    const resp = await fetch(src);
    if (!resp.ok) { console.warn("playBgm fetch failed:", resp.status, src); return; }
    const buf = await resp.arrayBuffer();
    const blob = new Blob([buf], { type: "audio/mpeg" });
    currentBgmBlobUrl = URL.createObjectURL(blob);
    currentBgm = new Audio(currentBgmBlobUrl);
    currentBgm.loop = true;
    await currentBgm.play();
  } catch (e) { console.warn("playBgm error:", e); }
}

export async function playSfx(src) {
  stopSfx();
  if (!getSoundEnabled()) return;
  try {
    const resp = await fetch(src);
    if (!resp.ok) { console.warn("playSfx fetch failed:", resp.status, src); return; }
    const buf = await resp.arrayBuffer();
    const blob = new Blob([buf], { type: "audio/mpeg" });
    currentSfxBlobUrl = URL.createObjectURL(blob);
    currentSfx = new Audio(currentSfxBlobUrl);
    currentSfx.addEventListener("ended", () => { stopSfx(); });
    await currentSfx.play();
  } catch (e) { console.warn("playSfx error:", e); }
}

function stopSfx() {
  if (currentSfx) {
    try { currentSfx.pause(); } catch { /* ignore */ }
    currentSfx.currentTime = 0;
    currentSfx = null;
  }
  if (currentSfxBlobUrl) {
    URL.revokeObjectURL(currentSfxBlobUrl);
    currentSfxBlobUrl = null;
  }
}

export function stopBgm() {
  if (currentBgm) {
    try { currentBgm.pause(); } catch { /* ignore */ }
    currentBgm.currentTime = 0;
    currentBgm = null;
  }
  if (currentBgmBlobUrl) {
    URL.revokeObjectURL(currentBgmBlobUrl);
    currentBgmBlobUrl = null;
  }
  stopSfx();
}
// Expose for ui.js (avoid circular import)
window.__stopBgm = stopBgm;
window.__stopSfx = stopSfx;
window.__playSfx = playSfx;

const AUDIO_MAP = {
  zoomZoom: "./sound/mazda.mp3",
  umaTracks: [
    "./sound/uma/4c8d1e6a.mp3",
    "./sound/uma/9b2f5c73.mp3",
    "./sound/uma/d1e4a8f6.mp3",
    "./sound/uma/umapyoi.mp3",
  ],
};

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
    energy: null,
    recognition: null,
    timeMinutes: null,
    rngSeed: null,

    role: null,
    run: null,
    actionsLog: [],
    pixelMissCount: 0,
    zoomMissCount: 0,
  };
}

function setEnding(state, endingKey) {
  stopBgm();
  const ending = getEnding(endingKey);
  state.screen = "ending";
  state.nodeId = null;
  state.phaseId = null;
  state.nodeTitle = ending?.name || "结局";
  state.nodeText = ending?.text || "";
  state.choices = [];
  state.select = null;
  state.endingName = ending?.name;
  state.endingText = ending?.text;
  if (state.run && !state.run.flags?.easterHasPinUsed) state.pixelMissCount = (state.pixelMissCount ?? 0) + 1;
  if (state.run && !state.run.flags?.easterZoomZoomUsed) state.zoomMissCount = (state.zoomMissCount ?? 0) + 1;
  saveGame(state);
  render(state);
}

function updateHudText(state) {
  if (state.run) {
    state.energy = state.run.energy;
    state.recognition = state.run.recognition;
  }
}

// ══════════════════════════════════════════════════════════
//  Engine bridge: translates engine action descriptors into
//  game.js UI/audio/save calls.  Used by dispatch for all
//  story-game nodes.
// ══════════════════════════════════════════════════════════

/**
 * Process an engine action descriptor, looping through redirects.
 */
function engineProcessAction(state, action) {
  while (action) {
    if (action.type === "redirect") {
      action = enterNode(state, action.nodeId);
      continue;
    }
    if (action.type === "ending") {
      if (state.run && !state.run.flags?.easterHasPinUsed) state.pixelMissCount = (state.pixelMissCount ?? 0) + 1;
      if (state.run && !state.run.flags?.easterZoomZoomUsed) state.zoomMissCount = (state.zoomMissCount ?? 0) + 1;
      stopBgm();
      const ending = getEnding(action.endingKey);
      state.screen = "ending";
      state.nodeId = null;
      state.phaseId = null;
      state.nodeTitle = ending?.name || "结局";
      state.nodeText = ending?.text || "";
      state.choices = [];
      state.select = null;
      state.endingName = ending?.name;
      state.endingText = ending?.text;
      saveGame(state);
      render(state);
      return;
    }
    if (action.type === "modal") {
      setModal(true, action);
      return;
    }
    if (action.type === "node") {
      stopBgm();
      state.screen = "game";
      state.nodeId = action.nodeId;
      state.nodeTitle = action.title || "";
      state.nodeText = action.text || "";
      state.choices = action.choices || [];
      state.select = action.select || null;
      state.autoDisableMs = action.autoDisableMs || 0;
      updateHudText(state);
      saveGame(state);
      render(state);

      // Audio hook — from engine registry
      const audioFn = getAudioHook(action.nodeId);
      if (audioFn) audioFn();

      // Achievement hook — from engine registry
      const achId = getAchievementHook(action.nodeId);
      if (achId) unlockAchievement(achId);
      return;
    }
    break;
  }
}

/**
 * Engine-based dispatch for story-game nodes.
 * Handles special UI modals (makeup confirm, expansion ad, etc.)
 * then delegates to the engine.
 */
function engineGameDispatch(state, actionId, ctx) {
  // ── Special modals that need UI (not pure engine logic) ──

  // Makeup choice confirmations
  if (state.nodeId === "d10") {
    if (actionId === "no") {
      setModal(true, {
        title: "提示",
        body: "确定不约妆吗？这之后你将以游客形态去到马娘Only。",
        confirmLabel: "正合我意",
        cancelLabel: "我再想想",
        onConfirm: () => {
          setModal(false);
          state.run.isTourist = true;
          engineProcessAction(state, handleChoice(state, actionId, ctx));
        },
      });
      return;
    }
    if (actionId === "yes") {
      setModal(true, {
        title: "提示",
        body: "确定约妆吗？这之后你将以coser形态去到马娘Only。",
        confirmLabel: "正合我意",
        cancelLabel: "我再想想",
        onConfirm: () => {
          setModal(false);
          engineProcessAction(state, handleChoice(state, actionId, ctx));
        },
      });
      return;
    }
  }

  // Prep skip when makeup booked
  if (state.nodeId === "d3" && actionId === "skip") {
    if (state.run.makeupBookedTime != null) {
      setModal(true, { title: "提醒", body: "可是你已经约了化妆师诶……", confirmLabel: "确认" });
      return;
    }
  }

  // d3 pick with disabled tourist
  if (state.nodeId === "d3" && actionId === "pick" && state.run.isTourist) {
    if (ctx.disabledClick) {
      setModal(true, { title: "提示", body: "你在此之前已经选择了以游客的形式参与。", confirmLabel: "好" });
      return;
    }
  }

  // Expansion: random ad modal (1/3 probability)
  if (state.nodeId === "ex_expansion" && actionId === "btn1") {
    const roll = Math.random();
    if (roll < 1 / 3) {
      setModal(true, {
        title: "关注我们",
        htmlBody:
          "首先感谢您游玩我们的游戏，您的支持就是我们最大的动力。<br><br>" +
          "如果您对我们的社团有着进一步的兴趣，可以通过以下方式掌握我们的最新动态：<br><br>" +
          "QQ群：308610161 <a href=\"https://qm.qq.com/q/YQvlAiqniU\" target=\"_blank\">点击添加</a><br>" +
          "小红书账号：ADEquipOfficial <a href=\"https://www.xiaohongshu.com/user/profile/685c15dc000000001b019187\" target=\"_blank\">点击前往</a>",
        confirmLabel: "好",
        onConfirm: () => {
          setModal(false);
          engineProcessAction(state, handleChoice(state, actionId, ctx));
        },
      });
      return;
    } else if (roll < 2 / 3) {
      setModal(true, {
        title: "也看看其他的社团？",
        htmlBody:
          "首先感谢您游玩我们的游戏，您的支持就是我们最大的动力。<br>" +
          "这里推荐一批同样很棒的同人社团和作者：<br>" +
          "CY还我血汗钱 QQ群：1039520736 <a href=\"https://qm.qq.com/q/vo8kGr0MV4\" target=\"_blank\">点击添加</a><br>"+
          "马铁U彩 QQ群：2151029801 <a href=\"https://qm.qq.com/q/Rf8CbiPxCw\" target=\"_blank\">点击添加</a><br>",
        confirmLabel: "好",
        onConfirm: () => {
          setModal(false);
          engineProcessAction(state, handleChoice(state, actionId, ctx));
        },
      });
      return;
    }
  }

  // ── Delegate to engine ──
  const action = handleChoice(state, actionId, ctx);
  if (action) {
    // Unlock "money" achievement on insufficient funds
    if (action.type === "modal" && action.body === "金钱不足") {
      unlockAchievement("money");
    }
    engineProcessAction(state, action);
  }
}

function dispatch(actionId, ctx = {}) {
  const state = window.__maoState;
  if (!state) return;

  // Record action to log
  if (!state.actionsLog) state.actionsLog = [];
  state.actionsLog.push({
    time: new Date().toISOString(),
    screen: state.screen,
    nodeId: state.nodeId,
    action: actionId,
  });

  if (actionId === "modal_confirm") {
    setModal(false);
    return render(state);
  }

  if (actionId === "restart") {
    stopBgm();
    clearGame();
    window.__maoState = createDefaultState();
    bindUI({ onAction: dispatch });
    render(window.__maoState);
    return;
  }

  if (state.screen === "mainMenu") {
    if (actionId === "start_role_select") {
      state.screen = "roleSelect";
      state.genderSelect = null;
      state.role = createRoleSelection(null, Math.random);
      state.nodeId = null;
      state.nodeTitle = "";
      state.nodeText = "";
      state.choices = [];
      state.select = null;
      state.rerollCount = 0;
      state.derDismissed = false;
      saveGame(state);
      render(state);
    }
    if (actionId === "start_doujin") {
      stopBgm();
      state.screen = "game";
      state.nodeId = null;
      state.nodeTitle = "";
      state.nodeText = "";
      state.choices = [];
      state.select = null;
      state.run = null;
      state.energy = null;
      state.recognition = null;
      state.timeMinutes = null;
      engineProcessAction(state, enterNode(state, doujinFirstNodeId()));
    }
    return;
  }

  if (state.screen === "roleSelect") {
    if (actionId === "roll_role" || actionId === "roll_role_again") {
      if (actionId === "roll_role_again") state.rerollCount = (state.rerollCount ?? 0) + 1;
      const genderVal = state.genderSelect ?? 0;
      state.role = createRoleSelection(genderVal, Math.random);
      saveGame(state);
      render(state);
    }
    if (actionId === "select_gender") {
      const val = Number(ctx.payload);
      state.genderSelect = (val === 0 || val === 1) ? val : null;
      state.role = createRoleSelection(state.genderSelect, Math.random);
      saveGame(state);
      render(state);
    }
    if (actionId === "dismiss_der") {
      state.derDismissed = true;
      saveGame(state);
      render(state);
    }
    if (actionId === "enter_game") {
      if (!state.role?.frozen) return;
      if (state.genderSelect == null) {
        unlockAchievement("walmart_bag");
        setModal(true, { title: "错误", body: "您还未选择性别，请选择一个性别来继续游戏。", confirmLabel: "好" });
        return;
      }
      stopBgm();
      state.run = createRunStateFromRole(state.role);
      state.energy = null;
      state.recognition = null;
      state.timeMinutes = null;
      state.screen = "game";
      // D-30 parent check (high school only)
      if (isHighSchool(state.role) && state.run?.specialId !== "none") {
        if (Math.random() < specialProbForParent(state.role.specialId)) {
          return setEnding(state, "hopeMature");
        }
      }
      engineProcessAction(state, enterNode(state, defaultFirstNodeId()));
    }
    return;
  }

  if (state.screen === "ending") {
    return;
  }

  if (state.screen === "game") {
    // ── Engine-based story dispatch ──
    return engineGameDispatch(state, actionId, ctx);
  }
}

function showBirthdayBanner() {
  const now = new Date();
  const today = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  const birthdayGirls = UMA_BIRTHDAYS.filter((u) => u.bday === today);
  if (birthdayGirls.length === 0) return;

  const names = birthdayGirls.map((u) => u.name).join("、");
  const banner = document.createElement("div");
  banner.className = "eventBanner";
  banner.innerHTML = `🎂 今天是赛马娘 ${names} 的生日，让我们祝她生日快乐！ 🎂`;
  document.body.insertBefore(banner, document.body.firstChild);
}

function showAnniversaryBanner() {
  const now = new Date();
  const today = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  if (today !== "06/25") return;

  const banner = document.createElement("div");
  banner.className = "eventBanner";
  banner.innerHTML = `🎉 今天是爱丽数位装备社的成立纪念日！ 🎉`;
  document.body.insertBefore(banner, document.body.firstChild);
}

function init() {
  applyTheme(getThemeId());
  showBirthdayBanner();
  showAnniversaryBanner();
  bindUI({ onAction: dispatch });

  const DISMISS_KEY = "maoOnly_textAdventure_dismissRestore";
  const savedState = loadGame();
  const dismissed = localStorage.getItem(DISMISS_KEY) === "1";

  if (savedState && !dismissed) {
    // 有存档且未被永久关闭：先显示主菜单，再弹窗询问
    const defaultState = createDefaultState();
    window.__maoState = defaultState;
    render(defaultState);

    setModal(true, {
      title: "要恢复进度吗",
      body: "检测到您之前的游玩被中断，从存档恢复进度还是重新开始游戏？",
      actions: [
        {
          label: "恢复进度",
          className: "primary",
          onClick: () => {
            window.__maoState = savedState;
            render(savedState);
          },
        },
        {
          label: "重新开始",
          onClick: () => {
            // 什么都不做，已在主菜单
          },
        },
        {
          label: "关闭且不再提示",
          onClick: () => {
            localStorage.setItem(DISMISS_KEY, "1");
          },
        },
      ],
    });
    return;
  }

  // 无存档 / 已永久关闭：正常加载
  let state = savedState || createDefaultState();

  // minimal migration / guards
  if (!state.screen) state = createDefaultState();
  if (!state.actionsLog) state.actionsLog = [];
  if (state.pixelMissCount == null) state.pixelMissCount = 0;
  if (state.zoomMissCount == null) state.zoomMissCount = 0;
  if (state.run && state.run.isTourist == null) state.run.isTourist = false;
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

