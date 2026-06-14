const THEME_KEY = "maoOnly_textAdventure_theme";

const THEMES = {
  default: {
    label: "默认",
    description: "你最熟悉的默认主题",
    async apply() {
      resetBodyBg();
      document.body.dataset.theme = "default";
      await applyDefaultPattern();
    },
  },
  digiPattern: {
    label: "爱丽数码",
    description: "爱丽数码生日专属主题",
    async apply() {
      document.body.dataset.theme = "digiPattern";
      await applyDigiPattern();
    },
  },
};

function resetBodyBg() {
  document.body.style.backgroundImage = "";
  document.body.style.backgroundSize = "";
  document.body.style.backgroundRepeat = "";
}

async function applyDefaultPattern() {
  const W = 100, H = 100;
  const dpr = window.devicePixelRatio || 1;
  try {
    const blobUrl = await fetch("./pic/default.png")
      .then((r) => r.blob())
      .then((b) => URL.createObjectURL(b));
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = blobUrl;
    });
    URL.revokeObjectURL(blobUrl);

    const cols = Math.ceil(window.innerWidth / W) + 1;
    const rows = Math.ceil(window.innerHeight / H) + 1;
    const c = document.createElement("canvas");
    c.width = cols * W * dpr;
    c.height = rows * H * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);

    const halfW = W / 2;
    for (let r = 0; r < rows; r++) {
      const offsetX = (r % 2) * halfW;
      for (let cl = 0; cl < cols; cl++) {
        ctx.drawImage(img, cl * W + offsetX, r * H, W, H);
      }
      // 奇数行左侧填补半格空缺
      if (r % 2 === 1) {
        ctx.drawImage(img, -halfW, r * H, W, H);
      }
    }

    document.body.style.backgroundImage = `url(${c.toDataURL()})`;
    document.body.style.backgroundSize = `${cols * W}px ${rows * H}px`;
    document.body.style.backgroundRepeat = "repeat";
  } catch (e) {
    console.warn("applyDefaultPattern failed:", e);
  }
}

async function applyDigiPattern() {
  const W = 240, H = 320;
  const dpr = window.devicePixelRatio || 1;
  try {
    const [b1, b2] = await Promise.all(
      ["./pic/digi1.png", "./pic/digi2.png"].map(async (src) => {
        const r = await fetch(src);
        return URL.createObjectURL(await r.blob());
      }),
    );
    const [img1, img2] = await Promise.all(
      [b1, b2].map(
        (u) =>
          new Promise((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = u;
          }),
      ),
    );
    URL.revokeObjectURL(b1);
    URL.revokeObjectURL(b2);
    const cols = Math.ceil(window.innerWidth / W) + 1;
    const rows = Math.ceil(window.innerHeight / H) + 1;
    const c = document.createElement("canvas");
    c.width = cols * W * dpr;
    c.height = rows * H * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    for (let r = 0; r < rows; r++)
      for (let cl = 0; cl < cols; cl++)
        ctx.drawImage((r + cl) % 2 === 0 ? img1 : img2, cl * W, r * H, W, H);
    document.body.style.backgroundImage = `url(${c.toDataURL()})`;
    document.body.style.backgroundSize = `${cols * W}px ${rows * H}px`;
    document.body.style.backgroundRepeat = "repeat";
  } catch (e) { console.warn("applyDigiPattern failed:", e); }
}

export function getThemeId() {
  try {
    return localStorage.getItem(THEME_KEY) || "default";
  } catch { return "default"; }
}

export function setThemeId(id) {
  try { localStorage.setItem(THEME_KEY, id); } catch { /* ignore */ }
}

export function getThemeList() {
  return Object.entries(THEMES).map(([id, t]) => ({ id, label: t.label, description: t.description }));
}

export function getThemeDesc(id) {
  return THEMES[id]?.description || "";
}

export async function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.digiPattern;
  await theme.apply();
}
