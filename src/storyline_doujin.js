// ── Doujin (社团) Mode Story Nodes ──────────────────────
// This module registers story nodes for the DLC "社团模式".
// Import this module as a side-effect to register all nodes.

import { registerNode, registerAchievementHook } from "./storyEngine.js";

// ══════════════════════════════════════════════════════════
//  社团模式 - 快来了.jpg
// ══════════════════════════════════════════════════════════

registerNode("doujin_start", (state) => {
  return {
    title: "快来了。",
    text:
      "欢迎来到社团模式！\n" +
      "这一模式是基于@草酸 @署前街奇宝 @四维清泰 等人的建议而诞生的全新DLC。\n" +
      "在这一全新的模式中，你可以扮演社团主催，通过完善你的同人创作，制定相应的宣发策略，使得你的创作在马娘Only上大放异彩！\n" +
      "我们真的正在做了（新建storyline_doujin.js）。",
    choices: [
      {
        id: "goto_wait_for_update",
        label: "问了没啊？",
        primary: true,
        next: "ending:waitForUpdate",
      },
    ],
  };
});

// ══════════════════════════════════════════════════════════
//  Storyline Interface — used by game.js
// ══════════════════════════════════════════════════════════

export function getFirstNodeId() {
  return "doujin_start";
}

export function createRoleSelection(_genderOverride, _rng) {
  // Doujin mode has no role selection; game.js should skip it
  return null;
}

export function createRunStateFromRole(_role) {
  // Doujin mode uses a minimal run state
  return {};
}

export function formatRoleText(_state) {
  return "";
}

export function registerDoujinHooks() {
  // No achievements or audio hooks for doujin mode yet
}
