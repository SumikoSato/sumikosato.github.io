// ── Story Engine: pure core for processing story nodes ─────
// This module is independent of UI/audio/storyline data.
// It only mutates state and returns action descriptors.
// Domain-specific helpers (parent check, energy death, etc.)
// belong in each storyline module, not here.

import { clamp } from "./utils.js";

// ── Pure helpers ─────────────────────────────────────────
export function clamp01to100(n) {
  return clamp(n ?? 0, 0, 100);
}

/** Check if player can afford a monetary cost. Pure — no side effects. */
export function checkAfford(state, cost) {
  const money = state?.run?.money ?? 0;
  return money >= cost;
}

// ── Effect applier ───────────────────────────────────────
/**
 * Apply a batch of effects to the game state.
 * Supported effect keys:
 *   money, energy, recognition, badges, timeMinutes
 *   cosplayAdd: name          — add to wardrobe
 *   cosplayMoveToBackpack: name — move wardrobe→backpack
 *   flag: { key: value }      — set a run.flags.*
 *   runField: { key: value }  — set any run.* field
 */
export function applyEffects(state, effects) {
  if (!effects || !state?.run) return;
  const r = state.run;

  if (effects.money != null) r.money = (r.money ?? 0) + effects.money;
  if (effects.energy != null) r.energy = clamp01to100((r.energy ?? 0) + effects.energy);
  if (effects.recognition != null) r.recognition = clamp01to100((r.recognition ?? 0) + effects.recognition);
  if (effects.badges != null) r.backpackBadges = Math.max(0, (r.backpackBadges ?? 0) + effects.badges);
  if (effects.timeMinutes != null) r.timeMinutes = (r.timeMinutes ?? 0) + effects.timeMinutes;

  if (effects.cosplayAdd) {
    r.wardrobeCosplays = [...(r.wardrobeCosplays || []), effects.cosplayAdd];
  }
  if (effects.cosplayMoveToBackpack) {
    const name = effects.cosplayMoveToBackpack;
    const idx = (r.wardrobeCosplays || []).indexOf(name);
    if (idx >= 0) {
      r.wardrobeCosplays = [...r.wardrobeCosplays];
      r.wardrobeCosplays.splice(idx, 1);
      r.backpackCosplays = [...(r.backpackCosplays || []), name];
    }
  }
  if (effects.flag) {
    if (!r.flags) r.flags = {};
    Object.assign(r.flags, effects.flag);
  }
  if (effects.runField) {
    Object.assign(r, effects.runField);
  }
}

// ── Registries ───────────────────────────────────────────
/** @type {Map<string, (state) => StoryNodeDef>} */
const nodeRegistry = new Map();

/** @type {Record<string, {name:string, text:string}>} */
let endingsRegistry = {};

/** @type {Record<string, () => void>} */
const audioHooks = {};

/** @type {Record<string, string>} nodeId -> achievementId */
const achievementHooks = {};

/** Register a story node factory. */
export function registerNode(id, factory) {
  nodeRegistry.set(id, factory);
}

/** Get a node definition by evaluating its factory. */
export function getNodeDef(state, nodeId) {
  const factory = nodeRegistry.get(nodeId);
  if (!factory) return null;
  return factory(state);
}

/** Register endings for a storyline. */
export function registerEndings(endings) {
  Object.assign(endingsRegistry, endings);
}

/** Register an audio callback for a node. */
export function registerAudioHook(nodeId, fn) {
  audioHooks[nodeId] = fn;
}

/** Register an achievement to unlock when entering a node. */
export function registerAchievementHook(nodeId, achievementId) {
  achievementHooks[nodeId] = achievementId;
}

/** Get the ending object by key. */
export function getEnding(endingKey) {
  return endingsRegistry[endingKey];
}

/** Get the audio hook for a node. */
export function getAudioHook(nodeId) {
  return audioHooks[nodeId];
}

/** Get the achievement ID for a node. */
export function getAchievementHook(nodeId) {
  return achievementHooks[nodeId];
}

/**
 * A StoryNodeDef is a plain object:
 * {
 *   title: string,
 *   text: string,
 *   choices: Array<{
 *     id: string,
 *     label: string,
 *     next: string,          // nodeId or "ending:xxx"
 *     cost?: number,         // money cost
 *     effects?: object,      // effects to apply on choice
 *     primary?: boolean,
 *     disabled?: boolean,
 *     disabledHint?: string,
 *     requiresBadges?: number,
 *     payload?: any,         // arbitrary data passed to next handler
 *   }>,
 *   select?: { label: string, options: Array<{value: string, label: string}> },
 *   phaseId?: string,        // set state.phaseId on enter
 *   autoDisableMs?: number,
 *   onEnter?: (state) => string | null | undefined,  // return "ending:xxx" or next nodeId to redirect
 *   onChoice?: (state, choiceId, ctx) => string | null | undefined, // pre-process a choice
 * }
 */

// ── Entry / transition helpers ───────────────────────────
/**
 * Enter a story node. Returns an action descriptor or null.
 * Action descriptor: { type: "node" | "ending" | "modal" | "redirect", ... }
 */
export function enterNode(state, nodeId) {
  const factory = nodeRegistry.get(nodeId);
  if (!factory) {
    console.warn("[storyEngine] unknown node:", nodeId);
    return { type: "node", nodeId, title: "错误", text: "未知节点: " + nodeId, choices: [] };
  }

  const def = factory(state);
  if (!def) return null;

  // Phase
  if (def.phaseId) state.phaseId = def.phaseId;

  // onEnter hook — can redirect
  if (def.onEnter) {
    const redirect = def.onEnter(state);
    if (redirect) {
      if (redirect.startsWith("ending:")) {
        return { type: "ending", endingKey: redirect.slice(7) };
      }
      return { type: "redirect", nodeId: redirect };
    }
  }

  // Update HUD mirror
  if (state.run) {
    state.energy = state.run.energy;
    state.recognition = state.run.recognition;
  }

  state.nodeId = nodeId;
  // Cache the raw definition so handleChoice doesn't re-evaluate the factory
  state._currentNodeDef = def;

  return {
    type: "node",
    nodeId,
    title: def.title || "",
    text: def.text || "",
    choices: (def.choices || []).map((c) => ({
      choiceId: c.id,
      label: c.label,
      primary: c.primary === true,
      disabled: c.disabled || false,
      disabledHint: c.disabledHint || "",
      requiresBadges: c.requiresBadges || 0,
      confirmModal: c.confirmModal || null,
      payload: c.next, // pass through for dispatch
    })),
    select: def.select || null,
    autoDisableMs: def.autoDisableMs || 0,
    _raw: def, // keep raw def for handleChoice
  };
}

/**
 * Handle a choice. Returns action descriptor.
 */
export function handleChoice(state, choiceId, ctx = {}) {
  // Use cached definition to avoid re-running factory side-effects
  const def = state._currentNodeDef || getNodeDef(state, state.nodeId);
  if (!def) return null;

  const choice = (def.choices || []).find((c) => c.id === choiceId);
  if (!choice) {
    console.warn("[storyEngine] unknown choice:", choiceId, "in node:", state.nodeId);
    return null;
  }

  // preChoice hook
  if (def.onChoice) {
    const redirect = def.onChoice(state, choiceId, ctx);
    if (redirect) {
      if (redirect.startsWith("ending:")) return { type: "ending", endingKey: redirect.slice(7) };
      return { type: "redirect", nodeId: redirect };
    }
  }

  // Cost check (affordability only — actual deduction via effects.money)
  if (choice.cost != null) {
    if (!checkAfford(state, choice.cost)) {
      return { type: "modal", title: "提示", body: "金钱不足", confirmLabel: "确认" };
    }
  }

  // Apply effects
  if (choice.effects) {
    applyEffects(state, choice.effects);
  }

  // Determine next node
  const next = typeof choice.next === "function" ? choice.next(state, ctx) : choice.next;
  if (!next) return null;

  if (next.startsWith("ending:")) {
    return { type: "ending", endingKey: next.slice(7) };
  }

  return { type: "redirect", nodeId: next, payload: choice.payload };
}

// ── Ending helpers ───────────────────────────────────────
export function buildEndingAction(endingKey) {
  const ending = endingsRegistry[endingKey];
  return {
    type: "ending",
    endingKey,
    title: ending?.name || "结局",
    text: ending?.text || "",
  };
}
