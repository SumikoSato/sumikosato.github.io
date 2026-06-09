export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function randInt(rng, min, max) {
  if (typeof rng === "number") {
    // Called as randInt(min, max) – legacy convenience
    max = min;
    min = rng;
    rng = Math.random;
  }
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function weightedPick(items, rng) {
  if (!items || items.length === 0) return null;
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].weight;
  }
  var r = rng() * total;
  var cumulative = 0;
  for (var j = 0; j < items.length; j++) {
    cumulative += items[j].weight;
    if (r < cumulative) return items[j].id;
  }
  return items[items.length - 1].id;
}

export function formatTimeHHMM(minutes) {
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

export function nowMs() {
  return Date.now ? Date.now() : new Date().getTime();
}
