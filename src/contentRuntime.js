// ══════════════════════════════════════════════════════════
//  contentRuntime.js — 数据驱动剧本运行时
//
//  解释 content/*.json 里描述的剧本，产出与旧版
//  storyEngine 完全相同的 action 描述符：
//    { type: "node" | "ending" | "redirect" | "modal" }
//
//  这样 game.js 的 engineProcessAction 不需要任何改动。
//
//  格式规范见 editor/docs/CONTENT-SCHEMA.md
// ══════════════════════════════════════════════════════════

import { registerEndings, registerAchievementHook, clamp01to100 } from "./storyEngine.js";
import { clamp, weightedPick } from "./utils.js";

// ── 内容仓库 ─────────────────────────────────────────────
const content = {
  manifest: { gameVersion: "0.0.0", storylines: [] },
  config: {},
  achievements: [],
  storylines: new Map(), // id -> { id, name, nodes: Map, endings, firstNode, kind, enabled }
};

/** 全部内容节点：nodeId -> { def, storylineId } */
const nodeIndex = new Map();

/** 名表：供 expr / lookup / pool 使用 */
let tables = {};

export function configureContent({ manifest, config, achievements, storylines }) {
  content.manifest = manifest || content.manifest;
  content.config = config || {};
  content.achievements = achievements || [];
  content.storylines = new Map();
  nodeIndex.clear();

  const allEndings = {};

  for (const sl of storylines || []) {
    const map = new Map();
    for (const n of sl.nodes || []) {
      if (map.has(n.id)) console.warn("[content] 剧本内节点 ID 重复:", sl.id, n.id);
      map.set(n.id, n);
      if (nodeIndex.has(n.id)) console.warn("[content] 跨剧本节点 ID 重复:", n.id);
      nodeIndex.set(n.id, { def: n, storylineId: sl.id });
    }
    content.storylines.set(sl.id, {
      id: sl.id,
      name: sl.name || sl.id,
      menuLabel: sl.menuLabel || sl.name || sl.id,
      kind: sl.kind || "direct",
      enabled: sl.enabled !== false,
      firstNode: sl.firstNode || (sl.nodes?.[0]?.id ?? null),
      nodes: map,
      endings: sl.endings || {},
    });
    Object.assign(allEndings, sl.endings || {});
  }

  // 跨剧本共享结局（新模式预告等）由 manifest.commonEndings 提供
  Object.assign(allEndings, content.manifest.commonEndings || {});
  registerEndings(allEndings);

  // 名表
  tables = {
    config: content.config,
    COSPLAY_POOL: content.config.cosplayPool || [],
    UMA_NAMES: content.config.cosplayPool || [],
    CAR_MODELS: content.config.carModels || [],
    ENDINGS: allEndings,
  };

  // 成就 → 节点钩子
  for (const a of content.achievements) {
    if (a.unlockOnNode) registerAchievementHook(a.unlockOnNode, a.id);
  }
  for (const sl of storylines || []) {
    for (const n of sl.nodes || []) {
      if (n.achievement) registerAchievementHook(n.id, n.achievement);
    }
  }
}

export function getContent() {
  return content;
}

export function isContentNode(nodeId) {
  return nodeIndex.has(nodeId);
}

export function getContentNodeDef(nodeId) {
  return nodeIndex.get(nodeId)?.def || null;
}

/** 该节点属于哪个剧本（编辑器预览时用来定位） */
export function getNodeStorylineId(nodeId) {
  return nodeIndex.get(nodeId)?.storylineId || null;
}

/** 全部已注册节点 id（编辑器/测试用） */
export function listNodeIds() {
  return [...nodeIndex.keys()];
}

export function getStoryline(id) {
  return content.storylines.get(id) || null;
}

export function getFirstNodeId(storylineId) {
  return content.storylines.get(storylineId)?.firstNode || null;
}

export function listMenuStorylines() {
  return [...content.storylines.values()].filter((s) => s.enabled && s.kind !== "hidden");
}

// ══════════════════════════════════════════════════════════
//  路径读写
// ══════════════════════════════════════════════════════════

function scopeOf(state, ctx, extra) {
  return { state, run: state?.run, role: state?.role, ctx: ctx || {}, $: extra?.$ };
}

/** 解析 `run.a.b` / `ctx.x` / `$.item` 形式的路径 */
export function resolvePath(state, ctx, path, extra) {
  if (path == null) return undefined;
  if (typeof path !== "string") return path;
  const sc = scopeOf(state, ctx, extra);
  const parts = path.split(".");
  let head = parts[0];
  let cur;
  if (head === "run" || head === "role" || head === "ctx" || head === "$" || head === "state") {
    cur = sc[head];
    parts.shift();
  } else {
    cur = sc.run; // 裸字段默认落在 run 上，写起来更短
  }
  if (cur == null) return undefined;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function assignPath(state, path, value) {
  const parts = String(path).split(".");
  const head = parts[0];
  let base;
  if (head === "run") { base = state.run; parts.shift(); }
  else if (head === "state") { base = state; parts.shift(); }
  else if (head === "role") { base = state.role; parts.shift(); }
  else { base = state.run; }
  if (base == null) return;
  let cur = base;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

// ══════════════════════════════════════════════════════════
//  模板插值
// ══════════════════════════════════════════════════════════

export function evalExpr(src, state, ctx, extra) {
  const sc = scopeOf(state, ctx, extra);
  const S = content.config;
  const fn = new Function(
    "state", "run", "role", "ctx", "$", "S",
    "COSPLAY_POOL", "UMA_NAMES", "CAR_MODELS", "ENDINGS",
    "clamp", "timeHHMM", "random", "has", "risk", "sample",
    "return (" + src + ");",
  );
  return fn(
    sc.state, sc.run, sc.role, sc.ctx, sc.$,
    S, tables.COSPLAY_POOL, tables.UMA_NAMES, tables.CAR_MODELS, tables.ENDINGS,
    clamp, timeHHMM, Math.random, hasInTable, (k) => riskRoll(state, k), sampleFrom,
  );
}

/** 解析单个 {{...}} 记号，返回**原始类型**的值 */
function tokenValue(token, state, ctx, extra) {
  if (token === "cosplay") return firstBackpackCos(state, "（未知服装）");
  if (token === "selected") return ctx?.selectedValue ?? extra?.$?.selected ?? "";
  if (token === "painCarModel") return state?.run?.painCarLabel || "";
  if (token === "painCarStyle") return state?.run?.painCarStyle || "";
  if (token === "time") return timeHHMM(state?.run?.timeMinutes ?? 0);
  if (token.startsWith("path:")) return resolvePath(state, ctx, token.slice(5).trim(), extra);
  if (token.startsWith("expr:")) return evalExpr(token.slice(5), state, ctx, extra);
  return resolvePath(state, ctx, token, extra);
}

export function renderTemplate(str, state, ctx, extra) {
  if (typeof str !== "string") return str;
  if (str.indexOf("{{") < 0) return str;
  // 整串恰好是一个 {{...}} 时必须保留原始类型（数字仍是数字）。
  // 否则 "{{expr: ...50...}}" 会变成字符串 "50"，之后 "50" + (-2) 会拼成
  // "50-2" 再被 Number 化 => NaN。这是必须守住的语义。
  const whole = /^\s*\{\{([\s\S]*?)\}\}\s*$/.exec(str);
  if (whole) return tokenValue(whole[1].trim(), state, ctx, extra);
  return str.replace(/\{\{([\s\S]*?)\}\}/g, (_, raw) => {
    const v = tokenValue(raw.trim(), state, ctx, extra);
    return v == null ? "" : String(v);
  });
}

function renderValue(v, state, ctx, extra) {
  if (typeof v === "string") return renderTemplate(v, state, ctx, extra);
  if (Array.isArray(v)) return v.map((x) => renderValue(x, state, ctx, extra));
  if (v && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v)) out[k] = renderValue(v[k], state, ctx, extra);
    return out;
  }
  return v;
}

// ══════════════════════════════════════════════════════════
//  小工具
// ══════════════════════════════════════════════════════════

export function timeHHMM(minutes) {
  const mm = ((Math.trunc(minutes ?? 0) % 1440) + 1440) % 1440;
  const pad = (x) => String(x).padStart(2, "0");
  return `${pad(Math.floor(mm / 60))}:${pad(mm % 60)}`;
}

function hasInTable(name, id) {
  const t = content.config[name];
  return Array.isArray(t) ? t.some((x) => x.id === id) : false;
}

export function firstBackpackCos(state, fallback = "-") {
  const list = state?.run?.backpackCosplays || [];
  return list[0] || fallback;
}

function sampleFrom(pool, count, rng = Math.random) {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

function pickFromTable(tableName, key) {
  const table = content.config[tableName];
  if (!Array.isArray(table)) return null;
  return table.find((x) => x.id === key) || null;
}

/** 精确复刻旧版 parentAndCompanyCheck() */
export function riskRoll(state, kind = "parentCompany") {
  const role = state?.role;
  const specialId = role?.specialId ?? state?.run?.specialId;
  const riskOf = (tableName) => {
    const t = content.config.riskTables?.[tableName] || [];
    const entry = t.find((x) => x.id === specialId);
    return entry ? Number(entry.prob) || 0 : 0;
  };
  const isHS = role?.templateId === "high_school";
  const isOffice = role?.templateId === "office";

  if ((kind === "parentCompany" || kind === "parent") && isHS && specialId !== "none") {
    if (Math.random() < riskOf("parent")) return "hopeMature";
  }
  if ((kind === "parentCompany" || kind === "company") && isOffice && specialId !== "none") {
    if (Math.random() < riskOf("company")) return "workWhy";
  }
  return null;
}

// ══════════════════════════════════════════════════════════
//  条件求值
// ══════════════════════════════════════════════════════════

export function evalCond(state, ctx, cond, extra) {
  if (cond == null || cond === true) return true;
  if (cond === false) return false;

  if (Array.isArray(cond)) return cond.every((c) => evalCond(state, ctx, c, extra));

  if (cond.all) return cond.all.every((c) => evalCond(state, ctx, c, extra));
  if (cond.any) return cond.any.some((c) => evalCond(state, ctx, c, extra));
  if (cond.not) return !evalCond(state, ctx, cond.not, extra);

  if (cond.chance != null) return Math.random() < Number(cond.chance);
  if (cond.chanceBelow != null || cond.rollBelow != null) {
    const bound = Number(cond.chanceBelow ?? cond.rollBelow);
    const roll = extra?.$roll != null ? extra.$roll : (extra.$roll = Math.random());
    return roll < bound;
  }

  if (cond.risk) {
    const got = riskRoll(state, cond.risk);
    if (cond.equals != null) return got === cond.equals;
    return got != null;
  }

  if (cond.expr != null) return !!evalExpr(cond.expr, state, ctx, extra);

  if (cond.path != null) {
    const left = resolvePath(state, ctx, cond.path, extra);
    const op = cond.op || "truthy";
    const right = cond.value !== undefined ? renderValue(cond.value, state, ctx, extra) : undefined;
    return compare(left, op, right);
  }

  console.warn("[content] 无法识别的条件:", cond);
  return false;
}

function compare(left, op, right) {
  switch (op) {
    case "==": return left === right;
    case "!=": return left !== right;
    case ">": return Number(left) > Number(right);
    case ">=": return Number(left) >= Number(right);
    case "<": return Number(left) < Number(right);
    case "<=": return Number(left) <= Number(right);
    case "contains": return String(left ?? "").includes(String(right));
    case "notContains": return !String(left ?? "").includes(String(right));
    case "startsWith": return String(left ?? "").startsWith(String(right));
    case "endsWith": return String(left ?? "").endsWith(String(right));
    case "matches": return new RegExp(String(right)).test(String(left ?? ""));
    case "in": return Array.isArray(right) && right.includes(left);
    case "notIn": return Array.isArray(right) && !right.includes(left);
    case "isNull": return left == null;
    case "notNull": return left != null;
    case "truthy": return !!left;
    case "falsy": return !left;
    case "empty": return left == null || left === "" || (Array.isArray(left) && left.length === 0);
    case "notEmpty": return !(left == null || left === "" || (Array.isArray(left) && left.length === 0));
    case "count==": return arrLen(left) === Number(right);
    case "count!=": return arrLen(left) !== Number(right);
    case "count>": return arrLen(left) > Number(right);
    case "count>=": return arrLen(left) >= Number(right);
    case "count<": return arrLen(left) < Number(right);
    case "count<=": return arrLen(left) <= Number(right);
    default:
      console.warn("[content] 未知运算符:", op);
      return false;
  }
}

function arrLen(v) {
  if (Array.isArray(v)) return v.length;
  if (typeof v === "string") return v.length;
  return 0;
}

// ══════════════════════════════════════════════════════════
//  步骤执行
// ══════════════════════════════════════════════════════════

/**
 * 执行一串步骤。返回跳转描述符或 null：
 *   { goto } | { ending } | null
 */
/** 把任意值安全地当数字用（字符串 "50" 也认，NaN/Infinity 归 0） */
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function runSteps(state, ctx, steps, extra) {
  if (!Array.isArray(steps)) return null;
  const r = state.run;

  for (const raw of steps) {
    const step = raw;
    if (!step || typeof step !== "object") continue;

    // 步骤级条件：{ "when": …, "set": … } —— 不满足就整条跳过
    if (step.when !== undefined && !evalCond(state, ctx, step.when, extra)) continue;

    // ── 数值糖 ──
    if (step.money != null && r) r.money = num(r.money) + num(step.money);
    if (step.energy != null && r) r.energy = clamp01to100(num(r.energy) + num(step.energy));
    if (step.recognition != null && r) r.recognition = clamp01to100(num(r.recognition) + num(step.recognition));
    if (step.badges != null && r) r.backpackBadges = Math.max(0, num(r.backpackBadges) + num(step.badges));
    if (step.time != null && r) r.timeMinutes = num(r.timeMinutes) + num(step.time);
    if (step.setTime != null && r) r.timeMinutes = timeToMinutes(renderValue(step.setTime, state, ctx, extra));
    if (step.timeToHour != null && r) r.timeMinutes = Number(step.timeToHour) * 60;

    // ── 通用读写 ──
    if (step.set) {
      for (const [p, v] of Object.entries(step.set)) {
        assignPath(state, p, renderValue(v, state, ctx, extra));
      }
    }
    if (step.add) {
      for (const [p, v] of Object.entries(step.add)) {
        const cur = resolvePath(state, ctx, p, extra) ?? 0;
        assignPath(state, p, Number(cur) + Number(renderValue(v, state, ctx, extra)));
      }
    }
    if (step.clamp) {
      for (const [p, range] of Object.entries(step.clamp)) {
        const cur = resolvePath(state, ctx, p, extra) ?? 0;
        assignPath(state, p, clamp(Number(cur), Number(range[0]), Number(range[1])));
      }
    }
    if (step.flag && r) {
      if (!r.flags) r.flags = {};
      for (const [k, v] of Object.entries(step.flag)) r.flags[k] = renderValue(v, state, ctx, extra);
    }

    // ── 列表 ──
    if (step.push) {
      const listPath = step.push.path;
      const list = resolvePath(state, ctx, listPath, extra);
      const next = Array.isArray(list) ? [...list] : [];
      next.push(renderValue(step.push.value, state, ctx, extra));
      assignPath(state, listPath, next);
    }
    if (step.move) {
      const from = resolvePath(state, ctx, step.move.from, extra);
      const value = renderValue(step.move.value, state, ctx, extra);
      if (Array.isArray(from)) {
        const idx = from.indexOf(value);
        if (idx >= 0) {
          const nf = [...from];
          nf.splice(idx, 1);
          assignPath(state, step.move.from, nf);
          const to = resolvePath(state, ctx, step.move.to, extra);
          assignPath(state, step.move.to, [...(Array.isArray(to) ? to : []), value]);
        }
      }
    }
    if (step.sample) {
      const pool = step.sample.pool === "COSPLAY_POOL" || step.sample.pool === "UMA_NAMES"
        ? tables.COSPLAY_POOL
        : (content.config[step.sample.pool] || []);
      const excluded = step.sample.exclude ? (resolvePath(state, ctx, step.sample.exclude, extra) || []) : [];
      const avail = (pool || []).filter((x) => !excluded.includes(x));
      const picked = sampleFrom(avail, Number(step.sample.count) || 0);
      if (step.sample.store) assignPath(state, step.sample.store, picked);
    }

    // ── 查表 / 随机 ──
    if (step.lookup) {
      const key = resolvePath(state, ctx, step.lookup.key, extra);
      const entry = pickFromTable(step.lookup.table, key);
      const raw = entry ? entry[step.lookup.field] : (step.lookup.default ?? 0);
      const val = Number(raw) || 0;
      const cur = resolvePath(state, ctx, step.lookup.target, extra) ?? 0;
      assignPath(state, step.lookup.target, step.lookup.mode === "set" ? val : Number(cur) + val);
    }
    if (step.hotelEnergy && r) {
      const entry = pickFromTable("hotels", r.hotelId);
      r.energy = clamp01to100((r.energy ?? 0) + (Number(entry?.energy) || 0));
    }
    if (step.roll) {
      const sides = Number(step.roll.sides) || 6;
      const n = Number(step.roll.count) || 1;
      let total = 0;
      for (let i = 0; i < n; i++) total += Math.floor(Math.random() * sides) + 1;
      assignPath(state, step.roll.store, total);
    }
    if (step.storeRandom) {
      assignPath(state, step.storeRandom, Math.random());
    }
    if (step.pendingDice && r) {
      r.pendingDice = renderValue(step.pendingDice, state, ctx, extra);
    }

    // ── 控制流 ──
    if (step.achievement) {
      extra?.unlock?.(step.achievement);
      if (!extra?.unlock && typeof window !== "undefined" && window.__unlockAchievement) {
        window.__unlockAchievement(step.achievement);
      }
    }
    if (step.risk) {
      const got = riskRoll(state, typeof step.risk === "string" ? step.risk : "parentCompany");
      if (got && (step.only == null || step.only === got)) return { ending: got };
    }
    if (step.modal) {
      return { modal: renderValue(step.modal, state, ctx, extra) };
    }
    if (step.goto) return { goto: renderTemplate(step.goto, state, ctx, extra) };
    if (step.ending) return { ending: renderTemplate(step.ending, state, ctx, extra) };
  }
  return null;
}

function timeToMinutes(v) {
  if (typeof v === "number") return v;
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(v));
  if (!m) return Number(v) || 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * 效果键白名单。规则/变体/选项上可以直接写效果
 * （例如 { "when": …, "set": {…} } 或 { "when": …, "energy": -5 }），
 * 也可以放进 steps 数组。两种写法运行时都支持。
 * 注意：`risk` 不在此列 —— 规则里的 risk 由 runRules 单独处理，避免重复掷骰。
 */
const EFFECT_KEYS = [
  "money", "energy", "recognition", "badges", "time", "setTime", "timeToHour",
  "set", "add", "clamp", "flag", "push", "move", "sample", "lookup",
  "hotelEnergy", "roll", "storeRandom", "pendingDice", "achievement", "modal",
  "goto", "ending",
];

/** 从对象里摘出内联效果，返回一个"伪步骤"对象或 null */
function inlineStep(obj) {
  const inline = {};
  let any = false;
  for (const k of EFFECT_KEYS) {
    if (obj[k] !== undefined) { inline[k] = obj[k]; any = true; }
  }
  return any ? inline : null;
}

/** 把「内联效果 + steps 数组」拼成一次执行序列 */
function stepSeq(obj) {
  const inline = inlineStep(obj);
  const steps = Array.isArray(obj.steps) ? obj.steps : [];
  return inline ? [inline, ...steps] : steps;
}

/** 顺序执行规则；返回跳转或 null */
export function runRules(state, ctx, rules, extra) {
  if (!Array.isArray(rules)) return null;
  for (const rule of rules) {
    if (!rule) continue;
    if (rule.risk) {
      const got = riskRoll(state, typeof rule.risk === "string" ? rule.risk : "parentCompany");
      if (got && (rule.only == null || rule.only === got)) return { ending: got };
      continue;
    }
    if (!evalCond(state, ctx, rule.when, extra)) continue;
    const jump = runSteps(state, ctx, stepSeq(rule), extra);
    if (jump) return jump;
  }
  return null;
}

// ══════════════════════════════════════════════════════════
//  选项构建
// ══════════════════════════════════════════════════════════

function buildChoices(state, ctx, def, extra) {
  let list = def.choices || [];

  if (def.choiceGen) {
    const gen = def.choiceGen;
    if (gen.sample) {
      runSteps(state, ctx, [{ sample: gen.sample }], extra);
    }
    const source = gen.sample?.store ? (resolvePath(state, ctx, gen.sample.store, extra) || []) : [];
    const generated = source.map((item, index) => {
      const localExtra = { ...extra, $: { index, item, selected: ctx?.selectedValue } };
      const tpl = renderValue(gen.template, state, ctx, localExtra);
      return { ...tpl, _bare: true };
    });
    list = [...generated, ...(gen.extra || [])];
  }

  const out = [];
  for (const c of list) {
    const localExtra = { ...extra, $: { index: out.length, item: c.__item, selected: ctx?.selectedValue } };
    if (c.visibleWhen && !evalCond(state, ctx, c.visibleWhen, localExtra)) continue;
    const hidden = c.hiddenWhen ? evalCond(state, ctx, c.hiddenWhen, localExtra) : false;
    if (hidden) continue;

    const primary = c.primaryWhen ? evalCond(state, ctx, c.primaryWhen, localExtra) : c.primary === true;
    const disabled = c.disabledWhen ? evalCond(state, ctx, c.disabledWhen, localExtra) : false;
    out.push({
      id: c.id,
      label: renderTemplate(c.label ?? "", state, ctx, localExtra),
      primary: !!primary,
      disabled: !!disabled,
      // 只有确实被禁用时才给提示：否则未禁用的按钮 hover 也会弹出这句说明
      disabledHint: (disabled && c.disabledHint) ? renderTemplate(c.disabledHint, state, ctx, localExtra) : "",
      requiresBadges: c.requiresBadges || 0,
      cost: c.cost,
      autoDisableMs: c.autoDisableMs,
    });
  }
  return out;
}

function buildSelect(state, ctx, def, extra) {
  const sel = def.select;
  if (!sel) return null;
  const src = resolvePath(state, ctx, sel.source, extra);
  const items = Array.isArray(src) ? src : [];
  let options;
  if (items.length === 0) {
    options = [{ value: "", label: sel.emptyText || "（无可选项）" }];
  } else if (typeof items[0] === "object" && items[0] !== null) {
    options = items.map((it) => ({
      value: String(it[sel.valueField || "id"]),
      label: String(it[sel.labelField || "label"]),
    }));
  } else {
    options = items.map((it) => ({ value: String(it), label: String(it) }));
  }
  return { label: renderTemplate(sel.label || "", state, ctx, extra), options };
}

// ══════════════════════════════════════════════════════════
//  节点求值
// ══════════════════════════════════════════════════════════

function mkExtra(state, ctx, unlock) {
  return { $: undefined, unlock };
}

/**
 * 进入一个内容节点，返回 action 描述符。
 */
export function enterContentNode(state, nodeId, opts = {}) {
  const entry = nodeIndex.get(nodeId);
  if (!entry) {
    console.warn("[content] 未知节点:", nodeId);
    return { type: "node", nodeId, title: "错误", text: "未知节点: " + nodeId, choices: [] };
  }
  const def = entry.def;
  const ctx = opts.ctx || {};
  const extra = mkExtra(state, ctx, opts.unlock);

  if (def.kind === "dice") return evalDiceNode(state, def, extra);

  // 告示页（黑底白字）：没有选项、没有跳转，进入后就是终点
  if (def.kind === "notice") {
    const tr = (v) => renderTemplate(v ?? "", state, ctx, extra);
    const lines = (Array.isArray(def.lines) ? def.lines : []).map((ln) => ({
      zh: tr(ln?.zh),
      yue: tr(ln?.yue),
      en: tr(ln?.en),
    }));
    const footer = def.footer
      ? { zh: tr(def.footer.zh), yue: tr(def.footer.yue), en: tr(def.footer.en) }
      : null;
    if (def.phase) state.phaseId = renderTemplate(def.phase, state, ctx, extra);
    state.nodeId = nodeId;
    return { type: "notice", nodeId, lines, footer };
  }

  if (def.phase) state.phaseId = renderTemplate(def.phase, state, ctx, extra);

  // 1) enter
  let jump = runSteps(state, ctx, def.enter, extra);
  // 2) rules
  if (!jump) jump = runRules(state, ctx, def.rules, extra);

  // 3) variants（首个命中）
  let content_ = null;
  if (!jump && Array.isArray(def.variants)) {
    for (const v of def.variants) {
      if (!evalCond(state, ctx, v.when, extra)) continue;
      const vJump = runSteps(state, ctx, stepSeq(v), extra);
      if (vJump) { jump = vJump; break; }
      content_ = v;
      break;
    }
  }

  if (jump) {
    if (jump.modal) return { type: "modal", ...jump.modal };
    if (jump.ending) return { type: "ending", endingKey: jump.ending };
    if (jump.goto) return { type: "redirect", nodeId: jump.goto };
    return { type: "node", nodeId, title: "", text: "", choices: [] };
  }

  // 4) random
  if (def.random) {
    const target = pickRandom(state, def.random, extra);
    if (target?.goto) return { type: "redirect", nodeId: renderTemplate(target.goto, state, ctx, extra) };
    if (target?.ending) return { type: "ending", endingKey: renderTemplate(target.ending, state, ctx, extra) };
  }

  // 变体提供的字段覆盖节点默认字段（未提供的沿用默认）
  const eff = content_ ? { ...def, ...content_ } : def;
  const title = renderTemplate(eff.title ?? "", state, ctx, extra);
  const text = renderTemplate(eff.text ?? "", state, ctx, extra);
  const choices = buildChoices(state, ctx, eff, extra);
  const select = buildSelect(state, ctx, eff, extra);
  const autoDisableMs = eff.autoDisableMs ?? 0;

  if (state.run) {
    state.energy = state.run.energy;
    state.recognition = state.run.recognition;
  }

  state.nodeId = nodeId;
  state._contentNode = { def, source: content_ || def };
  state._contentChoices = choices;

  return {
    type: "node",
    nodeId,
    title,
    text,
    choices: choices.map((c) => ({
      choiceId: c.id,
      label: c.label,
      primary: c.primary,
      disabled: c.disabled,
      disabledHint: c.disabledHint,
      requiresBadges: c.requiresBadges,
    })),
    select,
    autoDisableMs,
    fx: eff.fx || "",
    chrome: eff.chrome || "",
  };
}

function pickRandom(state, random, extra) {
  const items = random.pick || [];
  const weighted = items.map((it) => {
    let w = Number(it.weight) || 0;
    if (it.weightFrom) {
      const miss = Number(resolvePath(state, {}, it.weightFrom.missPath, extra)) || 0;
      w = Math.min(Number(it.weightFrom.base) + miss * Number(it.weightFrom.step), Number(it.weightFrom.max));
    }
    return { ...it, weight: w };
  });
  const total = weighted.reduce((s, x) => s + x.weight, 0);
  if (total <= 0) return null;
  let r = Math.random() * total;
  for (const it of weighted) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return weighted[weighted.length - 1];
}

/** 骰子节点结算 */
function evalDiceNode(state, def, extra) {
  const r = state.run || {};
  const p = r._dicePlayer ?? 0;
  const o = r._diceOpponent ?? 0;
  const key = p > o ? "win" : p < o ? "lose" : "draw";
  const pending = r.pendingDice?.[key] || null;

  if (pending) {
    const jump = runSteps(state, {}, pending.steps, extra);
    if (jump?.ending) return { type: "ending", endingKey: jump.ending };
    if (jump?.goto) return { type: "redirect", nodeId: jump.goto };
    if (pending.ending) return { type: "ending", endingKey: pending.ending };
    // `goto` 指向本节点的 default（通常是 exhibition_loop）时表示"继续"，
    // 与旧版 action:"continue" 同义：**不能**提前返回，必须继续往下走
    // 时间推进与精力/认可度/闭馆判定，否则会丢掉这三个结局分支。
    if (pending.goto && pending.goto !== def.default) {
      return { type: "redirect", nodeId: pending.goto };
    }
  }

  if (def.advanceTime && r) r.timeMinutes = num(r.timeMinutes) + num(def.advanceTime);

  for (const rule of def.after || []) {
    if (!evalCond(state, {}, rule.when, extra)) continue;
    if (rule.ending) return { type: "ending", endingKey: rule.ending };
    if (rule.goto) return { type: "redirect", nodeId: rule.goto };
  }
  if (def.default) return { type: "redirect", nodeId: def.default };
  return { type: "node", nodeId: def.id, title: "", text: "", choices: [] };
}

// ══════════════════════════════════════════════════════════
//  选项结算
// ══════════════════════════════════════════════════════════

export function resolveContentChoice(state, choiceId, ctx = {}, opts = {}) {
  // 把选项 id 暴露给条件表达式：{"path":"ctx.choiceId","op":"==","value":"pick"}
  // 节点的 onChoice 规则靠它区分是哪个选项触发的。
  ctx = { ...ctx, choiceId };
  const cur = state._contentNode;
  if (!cur) {
    console.warn("[content] 没有当前节点:", state.nodeId);
    return null;
  }
  const { def, source } = cur;
  const extra = mkExtra(state, ctx, opts.unlock);
  const choices = state._contentChoices || [];
  const meta = choices.find((c) => c.id === choiceId);
  if (!meta) {
    console.warn("[content] 未知选项:", choiceId, "于节点", state.nodeId);
    return null;
  }

  const gen = source.choiceGen || def.choiceGen;

  const all = [
    ...(gen?.extra || []),          // choiceGen 追加的固定选项（刷新商店 / 还是算了）
    ...(source.choices || []),
    ...(def.choices || []),
  ];
  // choiceGen 生成的选项按 id 反查模板
  let choice = all.find((c) => c.id === choiceId) || null;
  if (!choice && gen?.template) {
    const tplId = String(gen.template.id || "");
    const prefix = tplId.split("{{")[0];
    if (prefix && choiceId.startsWith(prefix)) {
      const source_store = resolvePath(state, ctx, gen.sample?.store, extra) || [];
      const m = /(\d+)$/.exec(choiceId);
      const index = m ? Number(m[1]) : -1;
      const item = source_store[index];
      if (item != null) {
        choice = renderValue(gen.template, state, ctx, { ...extra, $: { index, item, selected: ctx?.selectedValue } });
      }
    }
  }
  if (!choice) {
    console.warn("[content] 选项模板缺失:", choiceId);
    return null;
  }

  // ── 弹窗闸门 ──
  const gates = choice.gates || [];
  if (gates.length) {
    const gateExtra = { ...extra, $roll: undefined };
    for (const gate of gates) {
      if (!evalCond(state, ctx, gate.when, gateExtra)) continue;
      const gJump = runSteps(state, ctx, gate.steps, gateExtra);
      if (gate.modal) {
        const modal = renderValue(gate.modal, state, ctx, gateExtra);
        if (gate.block) {
          return { type: "modal", ...modal, _block: true };
        }
        return {
          type: "modal",
          ...modal,
          _continue: () => {
            const after = gJump || runSteps(state, ctx, stepSeq(choice), extra);
            return finishChoice(state, ctx, choice, after, extra);
          },
        };
      }
      if (gJump) return finishChoice(state, ctx, choice, gJump, extra);
    }
  }

  // ── 金钱不足 ──
  if (choice.cost != null) {
    const money = state?.run?.money ?? 0;
    if (money < choice.cost) {
      return { type: "modal", title: "提示", body: "金钱不足", confirmLabel: "确认" };
    }
  }

  // ── onChoice 钩子 ──
  const onChoice = source.onChoice || def.onChoice;
  if (Array.isArray(onChoice)) {
    const jump = runRules(state, ctx, onChoice, extra);
    if (jump) return finishChoice(state, ctx, choice, jump, extra);
  }

  // ── 应用效果 ──
  const jump = runSteps(state, ctx, stepSeq(choice), extra);
  return finishChoice(state, ctx, choice, jump, extra);
}

function finishChoice(state, ctx, choice, jump, extra) {
  if (jump?.ending) return { type: "ending", endingKey: jump.ending };
  if (jump?.goto) return { type: "redirect", nodeId: jump.goto };
  if (jump?.modal) return { type: "modal", ...jump.modal };
  if (choice.ending) return { type: "ending", endingKey: renderTemplate(choice.ending, state, ctx, extra) };
  if (choice.next) return { type: "redirect", nodeId: renderTemplate(choice.next, state, ctx, extra) };
  return null;
}

// ══════════════════════════════════════════════════════════
//  角色抽选 / 初始 run 状态（由 config 驱动）
// ══════════════════════════════════════════════════════════

export function createRoleSelection(genderOverride, rng = Math.random) {
  const cfg = content.config;
  const tmplIds = Object.keys(cfg.templates || {});
  if (!tmplIds.length) return null;
  const templateId = weightedPick(tmplIds.map((id) => ({ id, weight: cfg.templates[id].weight ?? 1 })), rng);
  const tpl = cfg.templates[templateId];

  const gender = (genderOverride === 0 || genderOverride === 1)
    ? genderOverride
    : weightedPick([{ id: 0, weight: 1 }, { id: 1, weight: 1 }], rng);

  let specialId = "none";
  let specialLabel = "无";
  if (tpl.riskTable) {
    const table = cfg.riskTables?.[tpl.riskTable] || [];
    specialId = weightedPick(table.map((x) => ({ id: x.id, weight: x.weight ?? 1 })), rng);
    specialLabel = table.find((x) => x.id === specialId)?.label ?? "-";
  }

  const phoneTable = (cfg.phoneModels || []).filter((p) => p.template === tpl.phoneGroup);
  const phoneId = weightedPick(phoneTable.map((p) => ({ id: p.id, weight: p.weight })), rng);
  const phone = phoneTable.find((p) => p.id === phoneId);

  let painCar = { id: "none", label: "无" };
  let painCarStyle = null;
  if (tpl.hasPainCar && tpl.painCarTable) {
    const table = cfg.painCarTables?.[tpl.painCarTable] || [];
    const picked = weightedPick(table.map((x) => ({ id: x.id, weight: x.weight })), rng);
    const row = table.find((x) => x.id === picked);
    painCar = { id: row.id, label: row.label };
    if (row.id !== "none") painCarStyle = sampleFrom(cfg.cosplayPool || [], 1, rng)[0];
  }

  const pool = cfg.cosplayPool || [];
  let wardrobe;
  if (painCarStyle) {
    const rest = pool.filter((c) => c !== painCarStyle);
    wardrobe = [painCarStyle, ...sampleFrom(rest, (tpl.wardrobeCosCount ?? 1) - 1, rng)];
  } else {
    wardrobe = sampleFrom(pool, tpl.wardrobeCosCount ?? 1, rng);
  }

  return {
    frozen: true,
    templateId,
    money: tpl.money,
    specialId,
    specialLabel,
    gender,
    phone: phone?.id,
    phoneLabel: phone?.label,
    wardrobeCosplays: wardrobe,
    painCarId: painCar.id,
    painCarLabel: painCar.label,
    painCarStyle,
  };
}

export function createRunStateFromRole(role) {
  const base = JSON.parse(JSON.stringify(content.config.runDefaults || {}));
  base.roleTemplateId = role?.templateId;
  base.money = role?.money;
  base.gender = role?.gender;
  base.specialId = role?.specialId;
  base.phone = role?.phone;
  base.phoneLabel = role?.phoneLabel;
  base.wardrobeCosplays = [...(role?.wardrobeCosplays || [])];
  base.painCarId = role?.painCarId;
  base.painCarLabel = role?.painCarLabel;
  base.painCarStyle = role?.painCarStyle;
  return base;
}

export function formatRoleText(state) {
  const role = state.role;
  if (!role) return "";
  if (state.genderSelect == null) {
    return ["性别：-", "金钱：-", "智能手机：-", "cosplay服装（衣柜）：-", "痛车：-", "痛车样式：-", "家长/公司强度：-"].join("\n");
  }
  return [
    `性别：${role.gender === 0 ? "男性" : role.gender === 1 ? "女性" : "-"}`,
    `金钱：${role.money}`,
    `智能手机：${role.phoneLabel || "-"}`,
    `拥有的cosplay服装：${role.wardrobeCosplays.join("，") || "-"}`,
    `痛车：${role.painCarLabel || "-"}`,
    `痛车样式：${role.painCarStyle || "-"}`,
    `家长/公司强度：${role.specialLabel || "-"}`,
  ].join("\n");
}
