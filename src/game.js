import { bindUI, render, setModal, setMenuStorylines, setVersionText, setAchievementList } from "./ui.js";
import { clearGame, loadGame, saveGame, getSoundEnabled } from "./storage.js";
import { unlockAchievement } from "./achievements.js";
import { UMA_BIRTHDAYS } from "./storyData.js";
import { applyTheme, getThemeId } from "./theme.js";

// 剧本里的 {"achievement": "id"} 步骤靠这个全局回调解锁成就。
// 放在模块级：预览模式（?goto=&preview=1）不走 init()，写进 init 会漏掉。
if (typeof window !== "undefined") window.__unlockAchievement = unlockAchievement;

// ── Story engine integration ─────────────────────────────
import {
  registerAudioHook,
  getEnding,
  getAudioHook,
  getAchievementHook,
} from "./storyEngine.js";

// ── 数据驱动剧本运行时（content/*.json）──────────────────
import {
  configureContent,
  isContentNode,
  getContentNodeDef,
  enterContentNode,
  resolveContentChoice,
  getFirstNodeId,
  listMenuStorylines,
  getStoryline,
  getNodeStorylineId,
  getContent,
  createRoleSelection,
  createRunStateFromRole,
  formatRoleText,
  riskRoll,
} from "./contentRuntime.js";

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

// 音频钩子：内置两个默认绑定（内容里没有 audio 字段时用它们）
registerAudioHook("ex_zoom_zoom", () => playBgm(AUDIO_MAP.zoomZoom));
registerAudioHook("ex_stage_program", () => playBgm(AUDIO_MAP.umaTracks[Math.floor(Math.random() * AUDIO_MAP.umaTracks.length)]));

/**
 * 按 content 里节点上的 `audio` 字段注册背景音乐。
 * 编辑器「节点编辑 → 音效 audio」下拉改的就是这个字段。
 * 可选值：zoomZoom / umaRandom / 或 config.audio 里的任意键。
 */
function registerAudioFromContent() {
  const model = getContent();
  const cfg = model?.config || {};
  const map = cfg.audio || {};
  const umaTracks = (map.umaTracks && map.umaTracks.length) ? map.umaTracks : AUDIO_MAP.umaTracks;
  const play = (key) => {
    if (!key) return;
    if (key === "zoomZoom") return playBgm(map.zoomZoom || AUDIO_MAP.zoomZoom);
    if (key === "umaRandom") {
      return playBgm(umaTracks[Math.floor(Math.random() * umaTracks.length)]);
    }
    if (map[key]) return playBgm(map[key]);
  };
  for (const sl of model?.storylines?.values?.() || []) {
    for (const n of sl.nodes.values()) {
      if (n.audio) registerAudioHook(n.id, () => play(n.audio));
    }
  }
}

// ══════════════════════════════════════════════════════════
//  「游戏结束」告示页：Cookie 记忆 + 全屏
//
//  触发过这条路线的玩家，在手动清除本站 Cookie 之前，每次打开页面
//  都只会看到黑底告示页（不再进主菜单）。用 Cookie 而不是 localStorage，
//  是因为"清除 Cookie"是浏览器里最直观的入口，玩家清完就能重新开始。
// ══════════════════════════════════════════════════════════

const SMOKE_NOTICE_COOKIE = "maoOnly_smokeNotice";
const SMOKE_NOTICE_COOKIE_AGE = 60 * 60 * 24 * 3650; // 10 年

function setSmokeNoticeCookie() {
  try {
    document.cookie = `${SMOKE_NOTICE_COOKIE}=1; path=/; max-age=${SMOKE_NOTICE_COOKIE_AGE}; SameSite=Lax`;
  } catch {
    /* file:// 或隐私模式下 Cookie 不可用，忽略 */
  }
}

function hasSmokeNoticeCookie() {
  try {
    return document.cookie
      .split(";")
      .some((part) => part.trim().split("=")[0] === SMOKE_NOTICE_COOKIE);
  } catch {
    return false;
  }
}

function clearSmokeNoticeCookie() {
  try {
    document.cookie = `${SMOKE_NOTICE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    /* 忽略 */
  }
}

/** 全屏。必须在用户手势里调用，否则浏览器会拒绝（静默失败即可）。 */
function requestNoticeFullscreen() {
  try {
    if (document.fullscreenElement) return;
    const el = document.documentElement;
    if (!el || !el.requestFullscreen) return;
    const p = el.requestFullscreen({ navigationUI: "hide" });
    if (p && typeof p.catch === "function") {
      // 被拒绝（没焦点、被策略拦下）就等下一次点击再试一次
      p.catch(() => armFullscreenOnFirstGesture());
    }
  } catch {
    /* 老浏览器 / 无手势：保持普通全窗口铺满 */
    armFullscreenOnFirstGesture();
  }
}

let fsArmed = false;

/**
 * 页面加载时没有用户手势，浏览器不允许直接进全屏。
 * 所以先铺满整个窗口，等玩家第一次点击/按键再补一次全屏请求。
 */
function armFullscreenOnFirstGesture() {
  if (fsArmed || document.fullscreenElement) return;
  fsArmed = true;
  const once = () => {
    fsArmed = false;
    document.removeEventListener("pointerdown", once, true);
    document.removeEventListener("keydown", once, true);
    requestNoticeFullscreen();
  };
  document.addEventListener("pointerdown", once, true);
  document.addEventListener("keydown", once, true);
}

/** 渲染强制告示页（从内容里取那三句，保证只有一份文案） */
function showForcedNotice() {
  const def = isContentNode("smoke_notice") ? getContentNodeDef("smoke_notice") : null;
  const state = createDefaultState();
  state.screen = "notice";
  state.nodeId = "smoke_notice";
  state.noticeLines = (def && Array.isArray(def.lines)) ? def.lines : [];
  state.noticeFooter = (def && def.footer) ? def.footer : null;
  window.__maoState = state;
  render(state);
  armFullscreenOnFirstGesture();
}

function createDefaultState() {
  return {
    gameVersion: "",
    screen: "mainMenu",
    menuTitle: "去马娘Only是什么感觉",
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
    fx: "",
    chrome: "",
    noticeLines: null,
    noticeFooter: null,

    storylineId: null,
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
  state.fx = "";
  state.chrome = "";
  state.noticeLines = null;
  state.noticeFooter = null;
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
      action = enterContentNode(state, action.nodeId);
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
      // 内容层返回的弹窗闸门可能带 _continue：确认后继续执行该选项
      if (typeof action._continue === "function") {
        const cont = action._continue;
        setModal(true, {
          ...action,
          onConfirm: () => {
            setModal(false);
            const next = cont();
            if (next) engineProcessAction(state, next);
          },
        });
      } else {
        setModal(true, action);
      }
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
      state.fx = action.fx || "";
      state.chrome = action.chrome || "";
      state.noticeLines = null;
      state.noticeFooter = null;
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
    if (action.type === "notice") {
      stopBgm();
      state.screen = "notice";
      state.nodeId = action.nodeId;
      state.nodeTitle = "";
      state.nodeText = "";
      state.choices = [];
      state.select = null;
      state.noticeLines = action.lines || [];
      state.noticeFooter = action.footer || null;
      // 走到这里这一局已经结束：清掉存档，刷新页面回到主菜单，
      // 否则玩家会永远停在黑屏上出不来。
      clearGame();
      // 记一笔 Cookie：之后每次访问都直接弹这页，直到玩家自己清除 Cookie。
      // 编辑器里预览不算数，否则创作者点一次预览就把自己锁在门外了；
      // 预览也不抢全屏，免得把编辑器窗口顶掉。
      const isPreview = Boolean(state.previewMode);
      if (!isPreview) setSmokeNoticeCookie();
      render(state);
      if (!isPreview) requestNoticeFullscreen();
      return;
    }
    break;
  }
}

/**
 * Engine-based dispatch for story-game nodes.
 * 所有特殊弹窗（约妆确认、扩列广告、游客拦截…）现在都由内容层
 * 的 choice.gates 描述，这里只做转发。
 */
function engineGameDispatch(state, actionId, ctx) {
  const action = isContentNode(state.nodeId)
    ? resolveContentChoice(state, actionId, ctx)
    : null;

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
      state.storylineId = ctx.payload || "default";
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
    if (actionId === "start_story") {
      const slId = ctx.payload;
      const first = getFirstNodeId(slId);
      if (!first) {
        setModal(true, { title: "错误", body: `剧本「${slId}」没有配置起始节点。`, confirmLabel: "好" });
        return;
      }
      stopBgm();
      state.storylineId = slId;
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
      engineProcessAction(state, enterContentNode(state, first));
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
      // D-30 家长查岗（仅高中生；只用 parent 表，与旧版一致）
      if (state.role?.templateId === "high_school" && state.run?.specialId !== "none") {
        if (riskRoll(state, "parent") === "hopeMature") {
          return setEnding(state, "hopeMature");
        }
      }
      engineProcessAction(state, enterContentNode(state, getFirstNodeId(state.storylineId || "default")));
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
  // 触发过「游戏结束」的玩家：在手动清除 Cookie 之前，每次访问都只弹告示页。
  // 放在最前面，所以不会进主菜单、不会弹恢复存档、也不显示纪念日横幅。
  if (hasSmokeNoticeCookie()) {
    showForcedNotice();
    return;
  }

  applyTheme(getThemeId());
  showBirthdayBanner();
  showAnniversaryBanner();
  bindUI({ onAction: dispatch });

  // 主菜单按钮由 content/manifest.json 决定
  setMenuStorylines(listMenuStorylines());

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
            rehydrate(savedState);
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
  if (!state.menuTitle) state.menuTitle = "去马娘Only是什么感觉";
  rehydrate(state);
  window.__maoState = state;
  render(state);
}

/**
 * 存档里不含 _contentNode（会被 saveGame 剥掉），恢复后需要重新进一次当前节点
 * 来重建选项与变体缓存，否则点击选项会没有反应。
 */
function rehydrate(state) {
  if (state.screen !== "game" || !state.nodeId) return;
  if (!isContentNode(state.nodeId)) return;
  try {
    enterContentNode(state, state.nodeId);
  } catch (e) {
    console.warn("rehydrate failed:", e);
  }
}

// ══════════════════════════════════════════════════════════
//  内容加载
// ══════════════════════════════════════════════════════════

const CONTENT_BASE = "./content/";

async function fetchJson(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`加载 ${url} 失败：HTTP ${resp.status}`);
  return resp.json();
}

async function loadContent() {
  const manifest = await fetchJson(CONTENT_BASE + "manifest.json");
  const [config, achievements] = await Promise.all([
    fetchJson(CONTENT_BASE + "config.json"),
    fetchJson(CONTENT_BASE + "achievements.json"),
  ]);

  const defs = (manifest.storylines || []).filter((s) => s.enabled !== false);
  const storylines = await Promise.all(
    defs.map(async (s) => {
      const body = await fetchJson(CONTENT_BASE + (s.file || `storyline.${s.id}.json`));
      return { ...body, id: body.id || s.id, name: s.name || body.name, kind: s.kind || body.kind };
    }),
  );

  configureContent({ manifest, config, achievements, storylines });

  // 成就列表以内容为准（编辑器改完重新加载就生效），不再走 achievements.js 里那份旧副本
  setAchievementList(Array.isArray(achievements) ? achievements : []);

  // 内容里显式声明了 audio 的节点会覆盖上面的内置默认绑定
  registerAudioFromContent();

  setVersionText(`${manifest.title || "UmaFesSimulator"} ${manifest.gameVersion || ""}`.trim());
  return manifest;
}

// ══════════════════════════════════════════════════════════
//  编辑器预览模式：?goto=<nodeId>&preview=1
// ══════════════════════════════════════════════════════════

/** 确定性随机数，让同一节点的预览每次一致 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function startPreview(nodeId, params) {
  // 预览走的是另一条启动路径，不会经过 init()，这些副作用要自己补上，
  // 否则按钮的 dispatchAction 是空的（点选项没反应）。
  applyTheme(getThemeId());
  bindUI({ onAction: dispatch });

  const seed = [...nodeId].reduce((s, c) => (s * 31 + c.charCodeAt(0)) | 0, 7);
  const rng = mulberry32(seed);

  const state = createDefaultState();
  state.previewMode = true;
  state.storylineId = getNodeStorylineId(nodeId) || "default";
  state.menuTitle = "编辑器预览";

  const gender = params.get("gender") != null ? Number(params.get("gender")) : 1;
  state.genderSelect = gender;
  state.role = createRoleSelection(gender, rng);

  if (params.get("template")) state.role.templateId = params.get("template");
  if (params.get("special")) {
    state.role.specialId = params.get("special");
    state.role.specialLabel = params.get("special") === "none" ? "无" : params.get("special") === "mid" ? "中" : "强";
  }

  state.run = createRunStateFromRole(state.role);

  // 预览用的合理默认值。
  // 否则像 exhibition_loop / dice_aftermath 这种依赖"本局中途状态"的节点，
  // 会因为 recognition 还是 null 而直接判成认可度归零结局，预览就失去意义了。
  // 查询参数可以逐个覆盖（?energy=…&recognition=…&time=HH:MM）。
  if (state.run.energy == null) state.run.energy = 100;
  if (state.run.recognition == null) state.run.recognition = 50;
  if (state.run.timeMinutes == null) state.run.timeMinutes = 9 * 60;

  const num = (k) => (params.has(k) ? Number(params.get(k)) : null);
  if (num("money") != null) state.run.money = num("money");
  if (num("energy") != null) state.run.energy = num("energy");
  if (num("recognition") != null) state.run.recognition = num("recognition");
  if (params.get("tourist") === "1") state.run.isTourist = true;
  if (params.get("travel")) state.run.travelMode = params.get("travel");
  if (params.get("hotel")) state.run.hotelId = params.get("hotel");
  if (num("makeup") != null) state.run.makeupBookedTime = num("makeup");
  if (params.get("makeupDone") === "1") state.run.makeupDone = true;

  const t = params.get("time");
  if (t) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t);
    state.run.timeMinutes = m ? Number(m[1]) * 60 + Number(m[2]) : Number(t) || 0;
  }
  const cos = params.get("cos");
  if (cos) state.run.backpackCosplays = cos === "none" ? [] : [cos];
  if (num("badges") != null) state.run.backpackBadges = num("badges");

  state.screen = "game";
  // dispatch 每次都从 window.__maoState 取当前状态，预览换了一份新 state
  // 就必须同步过去，否则点选项会作用在启动时那份空白状态上（点了没反应）。
  window.__maoState = state;
  engineProcessAction(state, enterContentNode(state, nodeId));
}

// Patch: ensure dispatch uses updated state reference
window.__maoDispatch = dispatch;

function fatal(e) {
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

(async function bootstrap() {
  try {
    await loadContent();

    const params = new URLSearchParams(location.search);
    const goto = params.get("goto");
    if (goto && isContentNode(goto)) {
      startPreview(goto, params);
      return;
    }
    init();
  } catch (e) {
    fatal(e);
  }
})();

