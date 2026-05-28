// ── Achievement system (independent of game state) ─────

const STORAGE_KEY = "maoOnly_textAdventure_achievements";

/** 成就注册表 */
export const ACHIEVEMENTS = [
  {
    id: "buy_a_der",
    title: "买个Der",
    desc: "众所周知，Der车是世界上最好开的车。",
    howToGet: '触发彩蛋"你买个Der！"',
  },
  {
    id: "walmart_bag",
    title: "沃尔玛购物袋",
    desc: "性别？我不到啊？我只是一个沃尔玛购物袋",
    howToGet: "游戏开始时没有选择性别",
  },
  {
    id: "super_brave",
    title: "我超勇的",
    desc: "那你这么说，你很勇哦？我超勇的好不好，我打败过超雄老大爷",
    howToGet: "打败了图谋不轨的老大爷",
  },
  {
    id: "heroine",
    title: "女中豪杰",
    desc: "你成功制止了对你图谋不轨的男性，你很勇敢。",
    howToGet: "打败了尝试搭讪甚至骚扰的男性",
  },
  {
  id: "makeup_run",
  title: "跑路的妆娘",
  desc: "卷款跑路的妆娘、懵逼的大家、以及没化妆的你。",
  howToGet: "遇到“妆娘跑路了！”事件",
  },
  {
  id: "mazda",
  title: "Zoom-Zoom",
  desc: "Zoom-Zoom\n今天我们把它从您心中唤醒了吗？",
  howToGet: "遇到另外一位马自达车主",
  },
  {
  id: "pixel",
  title: "因Pixel相遇",
  desc: "能在这种场合遇到Pixel用户，而且与自己兴趣相投，好好珍惜这个朋友吧。",
  howToGet: "遇到另外一位Pixel用户",
},
  {
    id: "konami_code",
    title: "Konami Code",
    desc: "↑↑↓↓←→←→BA",
    howToGet: "你说不定还摸清了作者的FC模拟器键位（使用移动设备时请连接外接键盘）",
  },
  {
    id: "money",
    title: "我钱呢？",
    desc: "坏了，这下兜里一分不剩了。",
    howToGet: "你在没有足够金钱的情况下尝试购买",
  },
];

/** 返回已解锁的成就 id 集合 */
export function getUnlockedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

/** 解锁一个成就，返回是否为新解锁 */
export function unlockAchievement(id) {
  const unlocked = getUnlockedIds();
  if (unlocked.has(id)) return false;
  unlocked.add(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  } catch { /* ignore */ }
  return true;
}
