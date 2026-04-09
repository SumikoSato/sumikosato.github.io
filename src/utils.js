export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function randInt(rng, minInclusive, maxInclusive) {
  const r = rng();
  const span = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(r * span);
}

// Weighted pick: items like [{id, weight}] where weight > 0
export function weightedPick(items, rng = Math.random) {
  const total = items.reduce((s, x) => s + x.weight, 0);
  if (total <= 0) throw new Error("weightedPick: total weight <= 0");
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it.id;
  }
  return items[items.length - 1].id;
}

export function formatTimeHHMM(minutes) {
  const mm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(mm / 60);
  const m = mm % 60;
  const pad = (x) => String(x).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

export function nowMs() {
  return Date.now();
}

