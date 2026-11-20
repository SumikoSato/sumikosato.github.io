const KEY = "maoOnly_textAdventure_save_v1";

export function saveGame(state) {
  try {
    // `_contentNode` / `_contentChoices` 是运行时的节点缓存，
    // 不进存档（否则内容更新后会读到过期的选项定义）。
    const { _contentNode, _contentChoices, ...persisted } = state;
    localStorage.setItem(KEY, JSON.stringify(persisted));
  } catch (e) {
    // Ignore storage failures (private mode, quota, etc.)
    console.warn("saveGame failed:", e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("loadGame failed:", e);
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

const SOUND_KEY = "maoOnly_textAdventure_sound";

export function getSoundEnabled() {
  try {
    const v = localStorage.getItem(SOUND_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "1" : "0");
  } catch {
    // ignore
  }
}

