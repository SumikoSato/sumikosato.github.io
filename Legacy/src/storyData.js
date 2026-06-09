import { UMA_NAMES, UMA_BIRTHDAYS } from "./umaNames.js";
export { UMA_BIRTHDAYS };
export { PAIN_CAR_MODELS_UNIVERSITY, PAIN_CAR_MODELS_OFFICE } from "./car.js";

export var GAME_VERSION = "C1.0.0";

export var PHONE_MODELS = [
  { id: "GooglePixel6Pro", label: "Google Pixel 6 Pro", weight: 5, template: "高中生" },
  { id: "IPhoneSE2", label: "iPhone SE2", weight: 9, template: "高中生" },
  { id: "RedmiNote11", label: "Redmi Note 11", weight: 90, template: "高中生" },

  { id: "GooglePixel7a", label: "Google Pixel 7a", weight: 5, template: "大学生" },
  { id: "IPhone15Plus", label: "iPhone 15 Plus", weight: 39, template: "大学生" },
  { id: "RedmiK70Pro", label: "Redmi K70 Pro", weight: 60, template: "大学生" },

  { id: "GooglePixel10ProXL", label: "Google Pixel 10 Pro XL", weight: 5, template: "社畜" },
  { id: "IPhone17ProMax", label: "iPhone 17 Pro Max", weight: 49, template: "社畜" },
  { id: "OPPOFindX8Ultra", label: "OPPO Find X8 Ultra", weight: 50, template: "社畜" },
];

export var HIGH_SCHOOL_TEMPLATE = "high_school";
export var COLLEGE_TEMPLATE = "college";
export var OFFICE_TEMPLATE = "office";

export var COSPLAY_POOL = UMA_NAMES;

export var ENDINGS = {
  neverStartDream: {
    name: "从未开始的梦",
    text: "你因为各种各样的原因和考虑，最终放弃了参与省城马娘Only。\n你很无奈，但没办法，只好在展会当天在群里复读「去马O，究竟是什么感觉」。",
  },
  hopeMature: {
    name: "希望我能变得更成熟一些",
    text: "你的家长在不知道什么时候，看到了你的手机。\n虽然你已经成年，而且刚刚高中毕业，但你的家长依旧十分生气，觉得你不听话。\n\u201C暑假这么长时间，不去打工，不去预习大学课程，非得和那些网上的狐朋狗友出去玩，他们什么学历你什么学历？你都这么大人了还和这些烂人玩，不好好爱惜羽毛。我们都是为你好，到时候你被这些不三不四，男扮女装的切了，都给他们数钱！\u201D\n计划去省城的漫展，被家长抓了。如果你成绩再好一些，如果你再勇敢一些，可能马上就能去省城马娘Only了。\n感情等方面也如此。得不到的，与其坚持，不如转移目标。这期间可能会遇到更好的，但也有可能更配不上。或许努力一些就能得到更好的，又或许向现实妥协，选择凑合下去。\n希望以后你能变得更成熟一些。",
  },
  loveYourself: {
    name: "要好好爱自己",
    text: "经过舟车劳顿，你还是不堪重负，倒下了。\n有人发现了你，把你送往最近的医院。\n回到家之后，你发现好多群友都在关心那个在马O路上晕倒的人怎么样了，你感受到了世界的善意。\n虽然如此，但是身体最重要，先好好爱自己，再去追求其他的热爱吧。",
  },
  workWhy: {
    name: "人为什么要上班",
    text: "你的老板突然打来了电话，虽然你知道今天是休息日。\n\u201C喂？你现在人在哪？打你好几个电话怎么都没接？现在客户要来审核，好几个文档都没有齐套，现在马上上会，把SMT、测试、硬件、组装领域的人都拉上来，把文档都对清楚了，别搞客诉！\u201D\n你在漫展上打开笔记本电脑干活的样子，像个异类。你不知道这种日子什么时候才是个头。\n不断地内卷已经击垮了你对美好事物的一切向往，你甚至感到了一种无助。\n于是你回到公司的第二天，就提了离职，希望下一家公司能对你好一些。",
  },
  selfDefense: {
    name: "正当防卫",
    text: "经过一整天的调解，对方受到了来自警方的批评教育。\n与此同时一段视频在互联网上疯狂传播，是对方恼羞成怒之后试图扒掉你的衣服，你将他控制在地上。\n评论区意外的一致，都是「有这样的力量，哪怕穿着裙子，那也是最男人的男人」。\n你有些欣慰。",
  },
  braveGirl: {
    name: "勇敢的女孩子",
    text: "经过一整天的调查，对方受到了来自警方的批评教育。\n与此同时一段视频在互联网上疯狂传播，是对方将身体凑到你的身上，你顺势将他控制在地上。\n评论区意外的一致，都是「姐妹好样的，是我们女性的榜样」。\n你有些欣慰。",
  },
  noOneLikesMe: {
    name: "没有人喜欢我",
    text: "因为无数的否定，你崩溃了。\n你发誓，以后再也不来这种地方。\n这不是你的问题，抱抱你。",
  },
  superStar: {
    name: "超级大明星",
    text: "你今天真的很亮眼。\n很多人都找你合影，和你交换物料，你超级开心。\n你的QQ也多出了很多的好友，你很享受这种被认可的感觉。",
  },
  nextTime: {
    name: "下次还来",
    text: "这是你第一次来这种同人展会。\n大家都很热情，你玩得也很开心，你觉得你下次一定要来。",
  },
  somewhatLost: {
    name: "有些失落",
    text: "这是你第一次来这种同人展会。\n你似乎没感到什么正反馈，甚至还有些失落，不知道下次还要不要来。",
  },
  realSomeoneLikesYou: {
    name: "真的会有人喜欢我吗",
    text: "这是你第一次来这种同人展会。\n你因为没有太多的正反馈，陷入了深深的自我质疑。\n这不是你的问题，抱抱你。",
  },
  onlineBully: {
    name: "遭到网暴",
    text: "回到家，你的朋友转发了一条小红书链接给你。\n点开一看，正是那天的你，评论区还有一群人说你丑就不要来出cos\n你很崩溃，你感觉这辈子都不会再出cos了。\n但是这不是你的问题，抱抱你。",
  },
  wigTorn: {
    name: "头套扯一地",
    text: "你的假发和衣服在场地内被撕成了碎片，他们拍着你的视频，肆意地嘲笑你。\n虽然你后来才知道出cos是一定要化妆的，但是你感到很痛苦，这辈子都不想出cos了，甚至你现在看着coser出现都会闪回。",
  },
};

export function getHotelEnergyDelta(hotelId) {
  if (hotelId === "RuSiHaoWeiDeng") return 80;
  if (hotelId === "HuaTing40") return 50;
  if (hotelId === "RuLaiJingXuan") return 20;
  if (hotelId === "HuaJiaoHotel") return 10;
  return 0;
}
