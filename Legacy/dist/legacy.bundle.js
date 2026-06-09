(function () {
  'use strict';

  /** @type {string[]} Full list of 121 UMA character names. */
  var UMA_NAMES = ["特别周", "无声铃鹿", "东海帝皇", "丸善斯基", "富士奇迹", "小栗帽", "黄金船", "伏特加", "大和赤骥", "大树快车", "草上飞", "菱亚马逊", "目白麦昆", "神鹰", "好歌剧", "成田白仁", "鲁道夫象征", "气槽", "爱丽数码", "青云天空", "玉藻十字", "美妙姿势", "琵琶晨光", "摩耶重炮", "曼城茶座", "美浦波旁", "目白赖恩", "菱曙", "雪之美人", "米浴", "艾尼斯风神", "爱丽速子", "爱慕织姬", "稻荷一", "胜利奖券", "空中神宫", "荣进闪耀", "真机伶", "川上公主", "黄金城", "樱花进王", "采珠", "新光风", "超级小海湾", "醒目飞鹰", "荒漠英雄", "东瀛佐敦", "中山庆典", "成田大进", "西野花", "春乌拉拉", "青竹回忆", "微光飞驹", "美丽周日", "待兼福来", "千明代表", "名将怒涛", "目白多伯", "优秀素质", "帝王光辉", "待兼诗歌剧", "生野狄杜斯", "目白善信", "大拓太阳神", "双涡轮", "里见光钻", "北部玄驹", "樱花千代王", "天狼星象征", "目白阿尔丹", "八重无敌", "鹤丸刚志", "目白光明", "樱花桂冠", "成田路", "也文摄辉", "狂怒乐章", "创升", "希望之城", "北方飞翔", "吉兆", "谷水琴蕾", "第一红宝石", "目白高峰", "真弓快车", "里见皇冠", "高尚骏逸", "极峰", "强击", "烈焰快驹", "凯斯奇迹", "森林宝穴", "信念", "莫名其妙", "爱如往昔", "小林历奇", "北港火山", "奇锐骏", "万籁争鸣", "莱斯莱斯", "葛城王牌", "新宇宙", "菱钻奇宝", "跳舞城", "大鸣大放", "莱茵力量", "西沙里奥", "空中救世主", "房一潘多拉", "迷人景致", "黄金巨匠", "贵妇人", "凯旋芭蕾", "梦之旅", "金镇之光", "多旺达", "吹波糖", "超常骏骥", "杏目", "放声欢呼", "唯独爱你", "创世驹", "黄金旅程", "神业", "比萨胜驹"];

  // 痛车数据库 — Legacy ES5 version of src/car.js
  // Car data is identical to the native version; only syntax is down-leveled.

  var CAMAZDA = "长安马自达";
  var FAWMAZDA = "一汽轿车马自达";
  var HNMAZDA = "海南马自达";
  var FAWAUDI = "一汽奥迪";
  var SEMITSUBISHI = "东南汽车";
  var SHVW = "上汽大众";
  var FAWVW = "一汽大众";
  var AUDI = "奥迪";
  var BJSUZUKI = "昌河铃木";
  var BJBENZ = "北京奔驰";
  var SYBMW = "华晨宝马";
  var CAR_MODELS = [{
    id: "DongnanV3",
    model: "V3菱悦",
    brand: SEMITSUBISHI
  }, {
    id: "Mazda6",
    model: "马自达6",
    brand: FAWMAZDA
  }, {
    id: "AudiA6L_C6",
    model: "A6L（C6）",
    brand: FAWAUDI
  }, {
    id: "LamandoLGTS",
    model: "凌渡L GTS 380TSI",
    brand: SHVW
  }, {
    id: "Mazda3_Axela",
    model: "马自达3 次世代昂克赛拉",
    brand: CAMAZDA
  }, {
    id: "AudiA6L_C8",
    model: "A6L（C8）",
    brand: FAWAUDI
  }, {
    id: "CC_RV",
    model: "CC 猎装版",
    brand: FAWVW
  }, {
    id: "S4_Avant",
    model: "S4 Avant",
    brand: AUDI
  }, {
    id: "WagonR",
    model: "北斗星",
    brand: BJSUZUKI
  }, {
    id: "AMG_A35L",
    model: "AMG A 35 L 4MATIC",
    brand: BJBENZ
  }, {
    id: "435I",
    model: "BMW 435i",
    brand: SYBMW
  }, {
    id: "BJ323",
    model: "323 福美来",
    brand: HNMAZDA
  }];
  var MODEL_MAP = {};
  for (var i = 0; i < CAR_MODELS.length; i++) {
    MODEL_MAP[CAR_MODELS[i].id] = CAR_MODELS[i];
  }

  /** 根据编号拼接完整的显示标签 */
  function getCarLabel(id) {
    var m = MODEL_MAP[id];
    if (!m) return id;
    return m.brand ? m.brand + " " + m.model : m.model;
  }
  function buildEntry(id, weight) {
    return {
      id: id,
      label: getCarLabel(id),
      weight: weight
    };
  }

  /** 大学生模板 */
  var PAIN_CAR_MODELS_UNIVERSITY = [{
    id: "none",
    label: "无",
    weight: 80
  }, buildEntry("BJ323", 5), buildEntry("WagonR", 5), buildEntry("DongnanV3", 5), buildEntry("Mazda6", 4), buildEntry("AudiA6L_C6", 1)];

  /** 社畜模板 */
  var PAIN_CAR_MODELS_OFFICE = [{
    id: "none",
    label: "无",
    weight: 40
  }, buildEntry("LamandoLGTS", 20), buildEntry("Mazda3_Axela", 25), buildEntry("AudiA6L_C8", 5), buildEntry("CC_RV", 5), buildEntry("435I", 2), buildEntry("AMG_A35L", 1), buildEntry("S4_Avant", 1)];

  var GAME_VERSION = "26.6.4-legacy";
  var PHONE_MODELS = [{
    id: "GooglePixel6Pro",
    label: "Google Pixel 6 Pro",
    weight: 5,
    template: "高中生"
  }, {
    id: "IPhoneSE2",
    label: "iPhone SE2",
    weight: 9,
    template: "高中生"
  }, {
    id: "RedmiNote11",
    label: "Redmi Note 11",
    weight: 90,
    template: "高中生"
  }, {
    id: "GooglePixel7a",
    label: "Google Pixel 7a",
    weight: 5,
    template: "大学生"
  }, {
    id: "IPhone15Plus",
    label: "iPhone 15 Plus",
    weight: 39,
    template: "大学生"
  }, {
    id: "RedmiK70Pro",
    label: "Redmi K70 Pro",
    weight: 60,
    template: "大学生"
  }, {
    id: "GooglePixel10ProXL",
    label: "Google Pixel 10 Pro XL",
    weight: 5,
    template: "社畜"
  }, {
    id: "IPhone17ProMax",
    label: "iPhone 17 Pro Max",
    weight: 49,
    template: "社畜"
  }, {
    id: "OPPOFindX8Ultra",
    label: "OPPO Find X8 Ultra",
    weight: 50,
    template: "社畜"
  }];
  var HIGH_SCHOOL_TEMPLATE = "high_school";
  var COLLEGE_TEMPLATE = "college";
  var OFFICE_TEMPLATE = "office";
  var COSPLAY_POOL = UMA_NAMES;
  var ENDINGS = {
    neverStartDream: {
      name: "从未开始的梦",
      text: "你因为各种各样的原因和考虑，最终放弃了参与省城马娘Only。\n你很无奈，但没办法，只好在展会当天在群里复读「去马O，究竟是什么感觉」。"
    },
    hopeMature: {
      name: "希望我能变得更成熟一些",
      text: "\u4F60\u7684\u5BB6\u957F\u5728\u4E0D\u77E5\u9053\u4EC0\u4E48\u65F6\u5019\uFF0C\u770B\u5230\u4E86\u4F60\u7684\u624B\u673A\u3002\n\u867D\u7136\u4F60\u5DF2\u7ECF\u6210\u5E74\uFF0C\u800C\u4E14\u521A\u521A\u9AD8\u4E2D\u6BD5\u4E1A\uFF0C\u4F46\u4F60\u7684\u5BB6\u957F\u4F9D\u65E7\u5341\u5206\u751F\u6C14\uFF0C\u89C9\u5F97\u4F60\u4E0D\u542C\u8BDD\u3002\n\u201C\u6691\u5047\u8FD9\u4E48\u957F\u65F6\u95F4\uFF0C\u4E0D\u53BB\u6253\u5DE5\uFF0C\u4E0D\u53BB\u9884\u4E60\u5927\u5B66\u8BFE\u7A0B\uFF0C\u975E\u5F97\u548C\u90A3\u4E9B\u7F51\u4E0A\u7684\u72D0\u670B\u72D7\u53CB\u51FA\u53BB\u73A9\uFF0C\u4ED6\u4EEC\u4EC0\u4E48\u5B66\u5386\u4F60\u4EC0\u4E48\u5B66\u5386\uFF1F\u4F60\u90FD\u8FD9\u4E48\u5927\u4EBA\u4E86\u8FD8\u548C\u8FD9\u4E9B\u70C2\u4EBA\u73A9\uFF0C\u4E0D\u597D\u597D\u7231\u60DC\u7FBD\u6BDB\u3002\u6211\u4EEC\u90FD\u662F\u4E3A\u4F60\u597D\uFF0C\u5230\u65F6\u5019\u4F60\u88AB\u8FD9\u4E9B\u4E0D\u4E09\u4E0D\u56DB\uFF0C\u7537\u626E\u5973\u88C5\u7684\u5207\u4E86\uFF0C\u90FD\u7ED9\u4ED6\u4EEC\u6570\u94B1\uFF01\u201D\n\u8BA1\u5212\u53BB\u7701\u57CE\u7684\u6F2B\u5C55\uFF0C\u88AB\u5BB6\u957F\u6293\u4E86\u3002\u5982\u679C\u4F60\u6210\u7EE9\u518D\u597D\u4E00\u4E9B\uFF0C\u5982\u679C\u4F60\u518D\u52C7\u6562\u4E00\u4E9B\uFF0C\u53EF\u80FD\u9A6C\u4E0A\u5C31\u80FD\u53BB\u7701\u57CE\u9A6C\u5A18Only\u4E86\u3002\n\u611F\u60C5\u7B49\u65B9\u9762\u4E5F\u5982\u6B64\u3002\u5F97\u4E0D\u5230\u7684\uFF0C\u4E0E\u5176\u575A\u6301\uFF0C\u4E0D\u5982\u8F6C\u79FB\u76EE\u6807\u3002\u8FD9\u671F\u95F4\u53EF\u80FD\u4F1A\u9047\u5230\u66F4\u597D\u7684\uFF0C\u4F46\u4E5F\u6709\u53EF\u80FD\u66F4\u914D\u4E0D\u4E0A\u3002\u6216\u8BB8\u52AA\u529B\u4E00\u4E9B\u5C31\u80FD\u5F97\u5230\u66F4\u597D\u7684\uFF0C\u53C8\u6216\u8BB8\u5411\u73B0\u5B9E\u59A5\u534F\uFF0C\u9009\u62E9\u51D1\u5408\u4E0B\u53BB\u3002\n\u5E0C\u671B\u4EE5\u540E\u4F60\u80FD\u53D8\u5F97\u66F4\u6210\u719F\u4E00\u4E9B\u3002"
    },
    loveYourself: {
      name: "要好好爱自己",
      text: "经过舟车劳顿，你还是不堪重负，倒下了。\n有人发现了你，把你送往最近的医院。\n回到家之后，你发现好多群友都在关心那个在马O路上晕倒的人怎么样了，你感受到了世界的善意。\n虽然如此，但是身体最重要，先好好爱自己，再去追求其他的热爱吧。"
    },
    workWhy: {
      name: "人为什么要上班",
      text: "\u4F60\u7684\u8001\u677F\u7A81\u7136\u6253\u6765\u4E86\u7535\u8BDD\uFF0C\u867D\u7136\u4F60\u77E5\u9053\u4ECA\u5929\u662F\u4F11\u606F\u65E5\u3002\n\u201C\u5582\uFF1F\u4F60\u73B0\u5728\u4EBA\u5728\u54EA\uFF1F\u6253\u4F60\u597D\u51E0\u4E2A\u7535\u8BDD\u600E\u4E48\u90FD\u6CA1\u63A5\uFF1F\u73B0\u5728\u5BA2\u6237\u8981\u6765\u5BA1\u6838\uFF0C\u597D\u51E0\u4E2A\u6587\u6863\u90FD\u6CA1\u6709\u9F50\u5957\uFF0C\u73B0\u5728\u9A6C\u4E0A\u4E0A\u4F1A\uFF0C\u628ASMT\u3001\u6D4B\u8BD5\u3001\u786C\u4EF6\u3001\u7EC4\u88C5\u9886\u57DF\u7684\u4EBA\u90FD\u62C9\u4E0A\u6765\uFF0C\u628A\u6587\u6863\u90FD\u5BF9\u6E05\u695A\u4E86\uFF0C\u522B\u641E\u5BA2\u8BC9\uFF01\u201D\n\u4F60\u5728\u6F2B\u5C55\u4E0A\u6253\u5F00\u7B14\u8BB0\u672C\u7535\u8111\u5E72\u6D3B\u7684\u6837\u5B50\uFF0C\u50CF\u4E2A\u5F02\u7C7B\u3002\u4F60\u4E0D\u77E5\u9053\u8FD9\u79CD\u65E5\u5B50\u4EC0\u4E48\u65F6\u5019\u624D\u662F\u4E2A\u5934\u3002\n\u4E0D\u65AD\u5730\u5185\u5377\u5DF2\u7ECF\u51FB\u57AE\u4E86\u4F60\u5BF9\u7F8E\u597D\u4E8B\u7269\u7684\u4E00\u5207\u5411\u5F80\uFF0C\u4F60\u751A\u81F3\u611F\u5230\u4E86\u4E00\u79CD\u65E0\u52A9\u3002\n\u4E8E\u662F\u4F60\u56DE\u5230\u516C\u53F8\u7684\u7B2C\u4E8C\u5929\uFF0C\u5C31\u63D0\u4E86\u79BB\u804C\uFF0C\u5E0C\u671B\u4E0B\u4E00\u5BB6\u516C\u53F8\u80FD\u5BF9\u4F60\u597D\u4E00\u4E9B\u3002"
    },
    selfDefense: {
      name: "正当防卫",
      text: "经过一整天的调解，对方受到了来自警方的批评教育。\n与此同时一段视频在互联网上疯狂传播，是对方恼羞成怒之后试图扒掉你的衣服，你将他控制在地上。\n评论区意外的一致，都是「有这样的力量，哪怕穿着裙子，那也是最男人的男人」。\n你有些欣慰。"
    },
    braveGirl: {
      name: "勇敢的女孩子",
      text: "经过一整天的调查，对方受到了来自警方的批评教育。\n与此同时一段视频在互联网上疯狂传播，是对方将身体凑到你的身上，你顺势将他控制在地上。\n评论区意外的一致，都是「姐妹好样的，是我们女性的榜样」。\n你有些欣慰。"
    },
    noOneLikesMe: {
      name: "没有人喜欢我",
      text: "因为无数的否定，你崩溃了。\n你发誓，以后再也不来这种地方。\n这不是你的问题，抱抱你。"
    },
    superStar: {
      name: "超级大明星",
      text: "你今天真的很亮眼。\n很多人都找你合影，和你交换物料，你超级开心。\n你的QQ也多出了很多的好友，你很享受这种被认可的感觉。"
    },
    nextTime: {
      name: "下次还来",
      text: "这是你第一次来这种同人展会。\n大家都很热情，你玩得也很开心，你觉得你下次一定要来。"
    },
    somewhatLost: {
      name: "有些失落",
      text: "这是你第一次来这种同人展会。\n你似乎没感到什么正反馈，甚至还有些失落，不知道下次还要不要来。"
    },
    realSomeoneLikesYou: {
      name: "真的会有人喜欢我吗",
      text: "这是你第一次来这种同人展会。\n你因为没有太多的正反馈，陷入了深深的自我质疑。\n这不是你的问题，抱抱你。"
    },
    onlineBully: {
      name: "遭到网暴",
      text: "回到家，你的朋友转发了一条小红书链接给你。\n点开一看，正是那天的你，评论区还有一群人说你丑就不要来出cos\n你很崩溃，你感觉这辈子都不会再出cos了。\n但是这不是你的问题，抱抱你。"
    },
    wigTorn: {
      name: "头套扯一地",
      text: "你的假发和衣服在场地内被撕成了碎片，他们拍着你的视频，肆意地嘲笑你。\n虽然你后来才知道出cos是一定要化妆的，但是你感到很痛苦，这辈子都不想出cos了，甚至你现在看着coser出现都会闪回。"
    }
  };
  function getHotelEnergyDelta(hotelId) {
    if (hotelId === "RuSiHaoWeiDeng") return 80;
    if (hotelId === "HuaTing40") return 50;
    if (hotelId === "RuLaiJingXuan") return 20;
    if (hotelId === "HuaJiaoHotel") return 10;
    return 0;
  }

  /* Legacy UI – no themes, no achievements, no localStorage menu, simplified FAB */
  var app$1 = document.getElementById("app");
  function el(tag, attrs, children) {
    attrs = attrs || {};
    children = children || [];
    var node = document.createElement(tag);
    var keys = Object.keys(attrs);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = attrs[k];
      if (k === "className") node.className = v;else if (k === "html") node.innerHTML = v;else if (k === "text") node.textContent = v;else if (k.indexOf("on") === 0 && typeof v === "function") node.addEventListener(k.slice(2), v);else {
        if (v === null || v === undefined) continue;
        node.setAttribute(k, v);
      }
    }
    for (var j = 0; j < children.length; j++) {
      var c = children[j];
      if (typeof c === "string") node.appendChild(document.createTextNode(c));else if (c) node.appendChild(c);
    }
    return node;
  }
  function makeCard(titleText) {
    var card = el("div", {
      className: "card"
    });
    var header = el("div", {
      className: "cardHeader"
    }, [el("div", {
      className: "title",
      text: titleText
    })]);
    var body = el("div", {
      className: "cardBody"
    });
    card.appendChild(header);
    card.appendChild(body);
    return {
      card: card,
      body: body
    };
  }
  var dispatchAction = null;
  function bindUI(opts) {
    dispatchAction = opts.onAction;
  }
  function setModal(open, opts) {
    if (!open) return;
    opts = opts || {};
    var body = opts.body || "";
    if (!body && opts.htmlBody) {
      body = opts.htmlBody.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
    }
    if (!body) return;
    if (opts.cancelLabel || opts.onConfirm) {
      if (window.confirm(body)) {
        if (opts.onConfirm) opts.onConfirm();else if (dispatchAction) dispatchAction("modal_confirm");
      }
    } else {
      window.alert(body);
      if (dispatchAction) dispatchAction("modal_confirm");
    }
  }
  function renderBar(label, value, innerClass) {
    var pct = Math.max(0, Math.min(100, value));
    return el("div", {
      className: "barWrap"
    }, [el("div", {
      className: "barLabel"
    }, [el("div", {
      text: label
    }), el("div", {
      text: String(value)
    })]), el("div", {
      className: "barOuter"
    }, [el("div", {
      className: innerClass || "barInner",
      style: "width:" + pct + "%;"
    })])]);
  }
  function appendFooter(container) {
    container.appendChild(el("div", {
      className: "pageFooter"
    }, [el("div", {}, [el("a", {
      href: "https://adequip.mysxl.cn/",
      target: "_blank",
      rel: "noopener noreferrer",
      text: "2025-2026 爱丽数位装备社 文案版权所有"
    })]), el("div", {}, [el("a", {
      href: "#",
      text: "版本号：UmaFesSimulator C1.0.0 复古平台专版",
      onclick: function onclick(e) {
        e.preventDefault();
        setModal(true, {
          title: "来自作者的一封信",
          body: "此为低版本浏览器兼容版，部分功能已简化。",
          confirmLabel: "我知道了"
        });
      }
    })])]));
  }
  function render(state) {
    if (!app$1) return;
    app$1.innerHTML = "";
    if (!state || !state.screen) {
      var c0 = makeCard("加载中");
      c0.body.appendChild(el("div", {
        className: "textBlock",
        text: "加载中..."
      }));
      app$1.appendChild(c0);
      return;
    }

    /* ── Main Menu ──────────────────────────────── */
    if (state.screen === "mainMenu") {
      var cm = makeCard("去马娘Only是什么感觉");
      cm.body.appendChild(el("p", {
        className: "lead",
        text: "今天这个时候你们应该已经在马O了吧，那种我从来没有去过的高级地方，看着那些我没见过的美丽谷子，领些那些我没领过的漂亮无料，跟各位老师近距离接触，我等你们回来，给我讲马O是有多好玩，看的开心，早点回来......去参加马O，是什么感觉......\n提示：点按最后的版本号，可查看来自作者的话。"
      }));
      cm.body.appendChild(el("div", {
        className: "controls"
      }, [el("button", {
        className: "primary",
        text: "开始游戏",
        onclick: function onclick() {
          if (dispatchAction) dispatchAction("start_role_select");
        }
      })]));
      app$1.appendChild(cm.card);
      appendFooter(app$1);
      return;
    }

    /* ── Role Select ───────────────────────────── */
    if (state.screen === "roleSelect") {
      var cr = makeCard("角色抽选");
      var pre = el("div", {
        className: "textBlock"
      });
      pre.appendChild(el("p", {
        text: "以下是你的角色信息，点按再次抽取来重新随机一次，相信我，你会等到好运气的。\n准备好的话，就开始吧~"
      }));
      if (state.role && state.role.frozen) {
        var list = el("div", {
          className: "textBlock"
        });
        var role = state.role;
        var templateLabel = role.templateId === "high_school" ? "高中生" : role.templateId === "college" ? "大学生" : role.templateId === "office" ? "社畜" : String(role.templateId || "-");
        var genderRow = el("div", {
          style: "margin:10px 0;"
        }, [el("span", {
          text: "性别："
        }), function () {
          var s = document.createElement("select");
          s.id = "genderSelect";
          var optBlank = document.createElement("option");
          optBlank.value = "";
          optBlank.textContent = "请选择性别";
          var optM = document.createElement("option");
          optM.value = "0";
          optM.textContent = "男性";
          var optF = document.createElement("option");
          optF.value = "1";
          optF.textContent = "女性";
          s.appendChild(optBlank);
          s.appendChild(optM);
          s.appendChild(optF);
          var sel = state.genderSelect;
          s.value = sel === 0 || sel === 1 ? String(sel) : "";
          s.addEventListener("change", function () {
            if (dispatchAction) dispatchAction("select_gender", {
              payload: s.value
            });
          });
          return s;
        }()]);
        list.appendChild(genderRow);
        var noGender = state.genderSelect == null;
        list.appendChild(el("p", {
          text: "角色类型：" + (noGender ? "-" : templateLabel)
        }));
        list.appendChild(el("p", {
          text: "金钱：" + (noGender ? "-" : role.money)
        }));
        list.appendChild(el("p", {
          text: "智能手机：" + (noGender ? "-" : role.phoneLabel || role.phone || "-")
        }));
        list.appendChild(el("p", {
          text: "cosplay服装（衣柜）：" + (noGender ? "-" : role.wardrobeCosplays.join("，") || "-")
        }));
        list.appendChild(el("p", {
          text: "痛车：" + (noGender ? "-" : role.painCarLabel || "-")
        }));
        list.appendChild(el("p", {
          text: "痛车样式：" + (noGender ? "-" : role.painCarStyle || "-")
        }));
        list.appendChild(el("p", {
          text: "家长/公司强度：" + (noGender ? "-" : role.specialLabel || "-")
        }));
        pre.appendChild(list);
      } else {
        pre.appendChild(el("p", {
          text: "点击开始后会自动完成抽选。"
        }));
      }
      cr.body.appendChild(pre);
      var ctrls = el("div", {
        className: "controls"
      });
      if (!state.role || !state.role.frozen) {
        ctrls.appendChild(el("button", {
          className: "primary",
          text: "开始抽选",
          onclick: function onclick() {
            if (dispatchAction) dispatchAction("roll_role");
          }
        }));
      } else {
        ctrls.appendChild(el("button", {
          text: "再次抽取",
          onclick: function onclick() {
            if (dispatchAction) dispatchAction("roll_role_again");
          }
        }));
        ctrls.appendChild(el("button", {
          className: "primary",
          text: "进入游戏",
          onclick: function onclick() {
            if (dispatchAction) dispatchAction("enter_game");
          }
        }));
      }
      cr.body.appendChild(ctrls);
      app$1.appendChild(cr.card);
      appendFooter(app$1);
      return;
    }

    /* ── Game ──────────────────────────────────── */
    if (state.screen === "game") {
      var cg = makeCard(state.nodeTitle || "");
      if (state.run) {
        var money = state.run.money != null ? state.run.money : 0;
        var badges = state.run.backpackBadges != null ? state.run.backpackBadges : 0;
        var isCoser = (state.run.backpackCosplays || []).length > 0;
        var pills = [el("div", {
          className: "resourcePill",
          text: "金钱：" + money
        }), el("div", {
          className: "resourcePill",
          text: "周边：" + badges
        })];
        if (state.recognition != null) {
          pills.push(el("div", {
            className: "resourcePill resourcePill--status",
            text: "形态：" + (isCoser ? "Coser" : "游客")
          }));
        }
        cg.body.appendChild(el("div", {
          className: "resourceLine"
        }, pills));
      }
      var bars = [];
      if (state.energy != null) bars.push(renderBar("精力", state.energy, "barInner"));
      if (state.recognition != null) bars.push(renderBar("认可", state.recognition, "barInner--recognition"));
      if (bars.length > 0) {
        cg.body.appendChild(el("div", {
          className: "hudGrid"
        }, bars));
        if (state.energy != null && state.recognition != null) {
          cg.body.appendChild(el("p", {
            text: "注意：认可度每半小时会自动减少2点",
            style: "color:#999; font-size:12px; margin:4px 0 0;"
          }));
        }
      }
      cg.body.appendChild(el("div", {
        className: "textBlock",
        style: "margin-top:14px;"
      }, [el("p", {
        text: state.nodeText || ""
      })]));
      if (state.select) {
        cg.body.appendChild(el("div", {
          className: "row",
          style: "margin-top:14px;"
        }, [el("div", {
          style: "width:100%;"
        }, [el("div", {
          text: state.select.label,
          style: "font-weight:900; margin-bottom:8px;"
        }), function () {
          var s = document.createElement("select");
          s.id = "uiSelect";
          for (var oi = 0; oi < state.select.options.length; oi++) {
            var opt = state.select.options[oi];
            var o = document.createElement("option");
            o.value = opt.value;
            o.textContent = opt.label;
            s.appendChild(o);
          }
          return s;
        }()])]));
      }
      var gameControls = el("div", {
        className: "controls"
      });
      var choices = state.choices || [];
      for (var ci = 0; ci < choices.length; ci++) {
        (function (c) {
          var badgesNow = state.run ? state.run.backpackBadges != null ? state.run.backpackBadges : 0 : 0;
          var needBadges = c.requiresBadges != null ? c.requiresBadges : 0;
          var badgeDisabled = needBadges > 0 && badgesNow < needBadges;
          var disabled = badgeDisabled || !!c.disabled;
          var title = badgeDisabled ? "需要周边数量：" + needBadges : c.disabledHint || null;
          gameControls.appendChild(el("button", {
            className: c.primary ? "primary" : "",
            text: c.label,
            disabled: disabled ? "" : null,
            title: title,
            onclick: function onclick() {
              if (disabled) {
                if (dispatchAction) dispatchAction(c.choiceId, {
                  payload: c.payload,
                  selectedValue: null,
                  disabledClick: true
                });
                return;
              }
              var selectEl = document.getElementById("uiSelect");
              var selectedValue = selectEl ? selectEl.value : null;
              if (dispatchAction) dispatchAction(c.choiceId, {
                payload: c.payload,
                selectedValue: selectedValue
              });
            }
          }));
        })(choices[ci]);
      }
      cg.body.appendChild(gameControls);
      if (state.autoDisableMs > 0) {
        var btns = gameControls.querySelectorAll("button");
        for (var bi = 0; bi < btns.length; bi++) btns[bi].disabled = true;
        (function (btnList, ms) {
          setTimeout(function () {
            for (var k = 0; k < btnList.length; k++) btnList[k].disabled = false;
          }, ms);
        })(btns, state.autoDisableMs);
      }
      app$1.appendChild(cg.card);
      appendFooter(app$1);
      return;
    }

    /* ── Ending ────────────────────────────────── */
    if (state.screen === "ending") {
      var ce = makeCard(state.endingName || "结局");
      ce.body.appendChild(el("div", {
        className: "textBlock",
        text: state.endingText || ""
      }));
      ce.body.appendChild(el("div", {
        className: "controls"
      }, [el("button", {
        className: "primary",
        text: "重新开始",
        onclick: function onclick() {
          if (dispatchAction) dispatchAction("restart");
        }
      })]));
      app$1.appendChild(ce.card);
      appendFooter(app$1);
      return;
    }

    /* ── Fallback ──────────────────────────────── */
    var cf = makeCard("错误");
    cf.body.appendChild(el("div", {
      className: "textBlock",
      text: "未知界面"
    }));
    app$1.appendChild(cf.card);
  }

  /* ── Simplified FAB: sound toggle only ─────────── */
  (function setupFab() {
    var soundEnabled = true;
    window.__getSoundEnabled = function () {
      return soundEnabled;
    };
    var wrapper = document.createElement("div");
    wrapper.className = "fab";
    var soundBtn = document.createElement("button");
    soundBtn.className = "fab__sound";
    var updateBtn = function updateBtn() {
      soundBtn.textContent = soundEnabled ? "声音开" : "声音关";
      soundBtn.title = soundEnabled ? "声音：开" : "声音：关";
    };
    updateBtn();
    soundBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      soundEnabled = !soundEnabled;
      if (!soundEnabled && window.__stopBgm) window.__stopBgm();
      updateBtn();
    });
    wrapper.appendChild(soundBtn);
    document.body.appendChild(wrapper);
  })();

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
  function randInt(rng, min, max) {
    if (typeof rng === "number") {
      // Called as randInt(min, max) – legacy convenience
      max = min;
      min = rng;
      rng = Math.random;
    }
    return Math.floor(rng() * (max - min + 1)) + min;
  }
  function weightedPick(items, rng) {
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
  function formatTimeHHMM(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  /**
   * @file Legacy game logic — ES5 port of src/game.js
   * All game logic, text, node IDs, and action IDs are identical to the native version.
   * Only syntax is down-leveled (const/let→var, no optional chaining, no template literals, etc.)
   * Removed: save/load, achievements, theme, async audio (fetch/Blob).
   */

  function clamp01to100(n) {
    return clamp(n, 0, 100);
  }

  // ── Audio management (Legacy: direct src, no fetch/Blob) ──────────
  var currentBgm = null;
  var currentSfx = null;
  function playBgm(src) {
    stopBgm();
    if (!getSoundEnabled()) return;
    try {
      currentBgm = new Audio();
      currentBgm.src = src;
      currentBgm.loop = true;
      currentBgm.load();
      currentBgm.play();
    } catch (e) {/* ignore */}
  }
  function playSfx(src) {
    stopSfx();
    if (!getSoundEnabled()) return;
    try {
      currentSfx = new Audio();
      currentSfx.src = src;
      currentSfx.addEventListener("ended", function () {
        stopSfx();
      });
      currentSfx.load();
      currentSfx.play();
    } catch (e) {/* ignore */}
  }
  function stopSfx() {
    if (currentSfx) {
      try {
        currentSfx.pause();
      } catch (e) {/* ignore */}
      currentSfx.currentTime = 0;
      currentSfx = null;
    }
  }
  function stopBgm() {
    if (currentBgm) {
      try {
        currentBgm.pause();
      } catch (e) {/* ignore */}
      currentBgm.currentTime = 0;
      currentBgm = null;
    }
    stopSfx();
  }

  // Sound enabled check (simple flag, no localStorage)
  var _soundEnabled = true;
  function getSoundEnabled() {
    return _soundEnabled;
  }
  function setSoundEnabled(v) {
    _soundEnabled = !!v;
  }

  // Expose for ui.js (avoid circular import)
  window.__stopBgm = stopBgm;
  window.__stopSfx = stopSfx;
  window.__playSfx = playSfx;
  window.__getSoundEnabled = getSoundEnabled;
  window.__setSoundEnabled = setSoundEnabled;
  var AUDIO_MAP = {
    zoomZoom: "../../sound/mazda.mp3",
    umaTracks: ["../../sound/uma/4c8d1e6a.mp3", "../../sound/uma/9b2f5c73.mp3", "../../sound/uma/d1e4a8f6.mp3", "../../sound/uma/umapyoi.mp3"]
  };
  function requireMoneyOrModal(state, cost) {
    var money = state.run && state.run.money != null ? state.run.money : 0;
    if (money >= cost) return true;
    setModal(true, {
      title: "提示",
      body: "金钱不足",
      confirmLabel: "确认"
    });
    return false;
  }
  function createDefaultState() {
    return {
      gameVersion: GAME_VERSION,
      screen: "mainMenu",
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
      role: null,
      run: null,
      actionsLog: [],
      pixelMissCount: 0,
      zoomMissCount: 0
    };
  }
  function isHighSchool(role) {
    return role && role.templateId === HIGH_SCHOOL_TEMPLATE;
  }
  function isCollege(role) {
    return role && role.templateId === COLLEGE_TEMPLATE;
  }
  function isOffice(role) {
    return role && role.templateId === OFFICE_TEMPLATE;
  }
  function specialProbForParent(specialId) {
    if (specialId === "none") return 0;
    if (specialId === "mid") return 0.03;
    if (specialId === "strong") return 0.08;
    return 0;
  }
  function specialProbForOffice(involutionId) {
    if (involutionId === "none") return 0;
    if (involutionId === "mid") return 0.05;
    if (involutionId === "strong") return 0.1;
    return 0;
  }
  function pickPhoneForTemplate(templateId, rng) {
    var tempLabel = templateId === HIGH_SCHOOL_TEMPLATE ? "高中生" : templateId === COLLEGE_TEMPLATE ? "大学生" : "社畜";
    var items = [];
    for (var i = 0; i < PHONE_MODELS.length; i++) {
      if (PHONE_MODELS[i].template === tempLabel) {
        items.push({
          id: PHONE_MODELS[i].id,
          weight: PHONE_MODELS[i].weight,
          label: PHONE_MODELS[i].label
        });
      }
    }
    var pickId = weightedPick(items, rng);
    var picked = null;
    for (var j = 0; j < items.length; j++) {
      if (items[j].id === pickId) {
        picked = items[j];
        break;
      }
    }
    return {
      id: picked.id,
      label: picked.label
    };
  }
  function sampleWithoutReplacement(pool, count, rng) {
    var arr = pool.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr.slice(0, count);
  }
  function createRoleSelection(genderOverride, rng) {
    if (!rng) rng = Math.random;
    var templateId = weightedPick([{
      id: HIGH_SCHOOL_TEMPLATE,
      weight: 1
    }, {
      id: COLLEGE_TEMPLATE,
      weight: 1
    }, {
      id: OFFICE_TEMPLATE,
      weight: 1
    }], rng);
    var money;
    var wardrobeCosCount;
    var hasPainCar = false;
    var painCarOptions = null;
    if (isHighSchool({
      templateId: templateId
    })) {
      money = 300;
      wardrobeCosCount = 1;
      hasPainCar = false;
    } else if (isCollege({
      templateId: templateId
    })) {
      money = 1000;
      wardrobeCosCount = 2;
      hasPainCar = true;
      painCarOptions = PAIN_CAR_MODELS_UNIVERSITY;
    } else {
      money = 2000;
      wardrobeCosCount = 3;
      hasPainCar = true;
      painCarOptions = PAIN_CAR_MODELS_OFFICE;
    }
    var gender = genderOverride === 0 || genderOverride === 1 ? genderOverride : weightedPick([{
      id: 0,
      weight: 1
    }, {
      id: 1,
      weight: 1
    }], rng);
    var specialId = "none";
    var specialLabel = "-";
    if (templateId === HIGH_SCHOOL_TEMPLATE || templateId === OFFICE_TEMPLATE) {
      var specialLevels = ["none", "mid", "strong"];
      specialId = specialLevels[randInt(rng, 0, 2)];
      specialLabel = specialId === "none" ? "无" : specialId === "mid" ? "中" : "强";
    }
    var phone = pickPhoneForTemplate(templateId, rng);
    var painCar = {
      id: "none",
      label: "无"
    };
    var painCarStyle = null;
    if (hasPainCar) {
      var painItems = [];
      for (var pi = 0; pi < painCarOptions.length; pi++) {
        painItems.push({
          id: painCarOptions[pi].id,
          weight: painCarOptions[pi].weight,
          label: painCarOptions[pi].label
        });
      }
      var painPickId = weightedPick(painItems, rng);
      var painPicked = null;
      for (var pp = 0; pp < painItems.length; pp++) {
        if (painItems[pp].id === painPickId) {
          painPicked = painItems[pp];
          break;
        }
      }
      painCar = {
        id: painPicked.id,
        label: painPicked.label
      };
      if (painCar.id !== "none") {
        painCarStyle = sampleWithoutReplacement(COSPLAY_POOL, 1, rng)[0];
      }
    }
    var wardrobeCosplays;
    if (painCarStyle) {
      var remaining = [];
      for (var rc = 0; rc < COSPLAY_POOL.length; rc++) {
        if (COSPLAY_POOL[rc] !== painCarStyle) remaining.push(COSPLAY_POOL[rc]);
      }
      wardrobeCosplays = [painCarStyle].concat(sampleWithoutReplacement(remaining, wardrobeCosCount - 1, rng));
    } else {
      wardrobeCosplays = sampleWithoutReplacement(COSPLAY_POOL, wardrobeCosCount, rng);
    }
    return {
      frozen: true,
      templateId: templateId,
      money: money,
      specialId: specialId,
      specialLabel: specialLabel,
      gender: gender,
      phone: phone.id,
      phoneLabel: phone.label,
      wardrobeCosplays: wardrobeCosplays,
      painCarId: painCar.id,
      painCarLabel: painCar.label,
      painCarStyle: painCarStyle
    };
  }
  function createRunStateFromRole(role) {
    return {
      roleTemplateId: role.templateId,
      money: role.money,
      gender: role.gender,
      specialId: role.specialId,
      phone: role.phone,
      phoneLabel: role.phoneLabel,
      wardrobeCosplays: role.wardrobeCosplays.slice(),
      backpackCosplays: [],
      backpackBadges: 0,
      painCarId: role.painCarId,
      painCarLabel: role.painCarLabel,
      painCarStyle: role.painCarStyle,
      travelMode: null,
      hotelId: null,
      makeupBookedTime: null,
      makeupDone: false,
      timeMinutes: null,
      recognition: null,
      energy: null,
      isTourist: false,
      flags: {
        easterHasPinUsed: false,
        easterZoomZoomUsed: false,
        noMakeupFirstUsed: false
      }
    };
  }
  function formatText(template, vars) {
    return template.replace(/\{\{(\w+)\}\}/g, function (_, k) {
      return vars && vars[k] != null ? vars[k] : "";
    });
  }
  function isPhonePixel(state) {
    return String(state.run && state.run.phoneLabel || "").indexOf("Pixel") >= 0;
  }
  function isPainCarMazda(state) {
    return String(state.run && state.run.painCarLabel || "").indexOf("马自达") >= 0;
  }
  function hasBackpackCosplay(state) {
    return (state.run && state.run.backpackCosplays || []).length >= 1;
  }
  function getAnyBackpackCosplay(state) {
    var list = state.run && state.run.backpackCosplays || [];
    return list[0] || null;
  }
  function getCosplayFromBackpackOrPlaceholder(state, placeholder) {
    return getAnyBackpackCosplay(state) || placeholder;
  }
  function checkAndEndNoOneLikesMeIfNeeded(state) {
    if (state.run && state.run.recognition != null && state.run.recognition <= 0) {
      setEnding(state, "noOneLikesMe");
      return true;
    }
    return false;
  }
  function checkAndEndLoveYourselfIfNeeded(state) {
    if (state.run && state.run.energy != null && state.run.energy <= 0) {
      setEnding(state, "loveYourself");
      return true;
    }
    return false;
  }
  function setEnding(state, endingKey) {
    stopBgm();
    var ending = ENDINGS[endingKey];
    state.screen = "ending";
    state.nodeId = null;
    state.phaseId = null;
    state.nodeTitle = ending && ending.name || "结局";
    state.nodeText = ending && ending.text || "";
    state.choices = [];
    state.select = null;
    state.endingName = ending && ending.name;
    state.endingText = ending && ending.text;
    if (state.run && !(state.run.flags && state.run.flags.easterHasPinUsed)) state.pixelMissCount = (state.pixelMissCount != null ? state.pixelMissCount : 0) + 1;
    if (state.run && !(state.run.flags && state.run.flags.easterZoomZoomUsed)) state.zoomMissCount = (state.zoomMissCount != null ? state.zoomMissCount : 0) + 1;
    render(state);
  }
  function updateHudText(state) {
    if (state.run) {
      state.energy = state.run.energy;
      state.recognition = state.run.recognition;
    }
  }
  function setGameNode(state, opts) {
    if (!opts) opts = {};
    stopBgm();
    state.screen = "game";
    state.nodeId = opts.nodeId;
    state.nodeTitle = opts.title || "";
    state.nodeText = opts.text || "";
    state.choices = opts.choices || [];
    state.select = opts.select || null;
    state.autoDisableMs = opts.autoDisableMs || 0;
    updateHudText(state);
    render(state);
  }
  function enterPhaseD30(state) {
    state.phaseId = "D-30";
    if (isHighSchool(state.role) && state.run && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setGameNodeParentCaughtEnding(state);
    }
    return enterNodeGoodWant(state);
  }
  function setGameNodeParentCaughtEnding(state) {
    setEnding(state, "hopeMature");
  }
  function enterNodeGoodWant(state) {
    return setGameNode(state, {
      nodeId: "good_want_enzao_gate",
      title: "好想去马娘Only",
      text: "这是一个晚上，你在QQ空间看见了列表在某地马娘Only玩得很开心，而你只是一个县城的coser，你知道这种盛大的且好玩的展会，与你这个身在小县城的人无关。\n直到你刷到了下一条说说，标题是：\n省城马娘Only 7/16 正式开展！\n你意识到省会好像离自己很近，于是加入了他们的群。而你看了看钱包和时间，你不知道自己真的能去到那里，和网上那些光鲜亮丽的coser一起玩。",
      choices: [{
        choiceId: "choice_good_want_go",
        label: "去！",
        primary: true
      }, {
        choiceId: "choice_good_want_skip",
        label: "还是算了......"
      }]
    });
  }
  function enterShopEnzao(state) {
    state.phaseId = "shop_enzao";
    return setGameNode(state, {
      nodeId: "shop_enzao",
      title: "嗯造工坊",
      text: "欢迎来到嗯造工坊，你可以在这里定制各种文创产品，只是交期我们从来都不敢向您保证......",
      choices: [{
        choiceId: "shop_enzao_buy_badges",
        label: "购买徽章*10（金钱-50）",
        primary: true
      }, {
        choiceId: "shop_enzao_skip",
        label: "还是算了"
      }]
    });
  }
  function enterPhaseD14(state) {
    state.phaseId = "D-14";
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setGameNodeParentCaughtEnding(state);
    }
    return setGameNode(state, {
      nodeId: "event_role_choice",
      title: "要出什么角色呢......?",
      text: "你看着那些出着手游新实装角色的决胜服，很好看，虽然你的手里的确有cos服，但因为是出过的，你总希望去这种新场合的时候要有一身新行头。",
      choices: [{
        choiceId: "choice_role_buy",
        label: "买套新的",
        primary: true
      }, {
        choiceId: "choice_role_skip",
        label: "还是算了"
      }]
    });
  }
  function enterShopTaobao(state) {
    var owned = {};
    var wc = state.run && state.run.wardrobeCosplays || [];
    for (var oi = 0; oi < wc.length; oi++) owned[wc[oi]] = true;
    var pool = [];
    for (var ci = 0; ci < COSPLAY_POOL.length; ci++) {
      if (!owned[COSPLAY_POOL[ci]]) pool.push(COSPLAY_POOL[ci]);
    }
    var picks = sampleWithoutReplacement(pool, 4, Math.random);
    state.run.shopCosOptions = picks;
    var choices = [];
    for (var i = 0; i < picks.length; i++) {
      choices.push({
        choiceId: "buy_cos_" + i,
        label: "购买 " + picks[i] + " cos服*1（金钱-500）",
        primary: i === 0
      });
    }
    choices.push({
      choiceId: "shop_taobao_reroll",
      label: "刷新商店"
    });
    choices.push({
      choiceId: "shop_taobao_skip",
      label: "还是算了"
    });
    return setGameNode(state, {
      nodeId: "shop_taobao",
      title: "掏宝商城",
      text: "欢迎来到掏宝商城，这里你能买到各种各样的cos服，种类齐全，价格实惠。",
      choices: choices
    });
  }
  function enterPhaseD10(state) {
    state.phaseId = "D-10";
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setGameNodeParentCaughtEnding(state);
    }
    return setGameNode(state, {
      nodeId: "event_makeup_choice",
      title: "要约化妆师吗",
      text: "距离马O还剩下10天，你发现：如果你需要出cos的话，你需要一个化妆师（当然，群里管这个叫妆娘），虽然约妆的确是有点花钱，但是实际上，如果不化妆的话，除非你是那种超级好看的，否则还是很容易被人头套扯一地。\n当然，如果你想做游客的话，倒也没关系。",
      choices: [{
        choiceId: "choice_makeup_yes",
        label: "去约妆",
        primary: true
      }, {
        choiceId: "choice_makeup_no",
        label: "还是算了，游客，启动！"
      }]
    });
  }
  function enterShopMakeup(state) {
    return setGameNode(state, {
      nodeId: "shop_makeup",
      title: "约妆",
      text: "宝子们快来找我约妆呀~",
      choices: [{
        choiceId: "makeup_7",
        label: "预约当天7点的化妆（金钱-40）",
        primary: true
      }, {
        choiceId: "makeup_8",
        label: "预约当天8点的化妆（金钱-50）"
      }, {
        choiceId: "makeup_9",
        label: "预约当天9点的化妆（金钱-60）"
      }, {
        choiceId: "makeup_10",
        label: "预约当天10点的化妆（金钱-80）"
      }, {
        choiceId: "shop_makeup_skip",
        label: "还是算了"
      }]
    });
  }
  function enterPhaseD7(state) {
    state.phaseId = "D-7";
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setGameNodeParentCaughtEnding(state);
    }
    var hasPainCar = state.run.painCarId && state.run.painCarId !== "none";
    if (hasPainCar) {
      return setGameNode(state, {
        nodeId: "event_paincar_open",
        title: "开痛车去吗",
        text: "距离马O还剩下7天，你需要考虑一下你的出行方式。相比其他爱好者来讲，你很幸运有一辆（" + state.run.painCarLabel + "）的（" + state.run.painCarStyle + "）痛车，你在思考要不要把车开过去。",
        choices: [{
          choiceId: "paincar_open",
          label: "开！（需要燃油费-200）",
          primary: true
        }, {
          choiceId: "paincar_close",
          label: "不开！"
        }]
      });
    }
    return enterNodeTravelMode(state);
  }
  function enterNodeTravelMode(state) {
    return setGameNode(state, {
      nodeId: "event_travel_mode",
      title: "出行方式",
      text: "距离马O还剩下7天，你需要考虑一下你的出行方式。\n先打开不顺路出行App看看票吧。",
      choices: [{
        choiceId: "travel_open_app",
        label: "打开不顺路出行App",
        primary: true
      }, {
        choiceId: "travel_too_expensive",
        label: "好贵，还是算了"
      }]
    });
  }
  function enterShopNotShunLu(state) {
    return setGameNode(state, {
      nodeId: "shop_not_shunlu",
      title: "不顺路出行",
      text: "欢迎来到不顺路出行，我们可以预约各种各样的交通方式，包给您添堵的。",
      choices: [{
        choiceId: "ticket_highspeed",
        label: "购买高铁票*1（金钱-200）",
        primary: true
      }, {
        choiceId: "ticket_flight",
        label: "购买飞机票*1（金钱-500）"
      }, {
        choiceId: "ticket_hardseat",
        label: "购买硬座票*1（金钱-50）"
      }, {
        choiceId: "ticket_skip",
        label: "还是算了"
      }]
    });
  }
  function enterPhaseD5(state) {
    state.phaseId = "D-5";
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setGameNodeParentCaughtEnding(state);
    }
    return setGameNode(state, {
      nodeId: "event_hotel_choice",
      title: "该住哪里",
      text: "距离马O还剩下5天，你需要考虑一下你到了那边该住哪里，总不能睡大街吧？",
      choices: [{
        choiceId: "hotel_open_app",
        label: "打开不去哪儿网App",
        primary: true
      }, {
        choiceId: "hotel_too_expensive",
        label: "好贵，还是算了"
      }]
    });
  }
  function enterShopGoWhere(state) {
    return setGameNode(state, {
      nodeId: "shop_bu_qu_nar",
      title: "不去哪儿网",
      text: "欢迎来到不去哪儿网，我们可以预订从低端到高端各种各样的酒店，至于售后和客服？不存在的！",
      choices: [{
        choiceId: "hotel_huaJiao",
        label: "预定花椒酒店（金钱-80）",
        primary: true
      }, {
        choiceId: "hotel_ruLai",
        label: "预定如来精选（金钱-100）"
      }, {
        choiceId: "hotel_huaTing",
        label: "预定华庭4.0（金钱-200）"
      }, {
        choiceId: "hotel_ruSi",
        label: "预定瑞思豪威登（金钱-500）"
      }, {
        choiceId: "hotel_skip",
        label: "还是算了"
      }]
    });
  }
  function enterPhaseD3(state) {
    state.phaseId = "D-3";
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setGameNodeParentCaughtEnding(state);
    }
    var wardrobe = state.run.wardrobeCosplays || [];
    var options = [];
    for (var wi = 0; wi < wardrobe.length; wi++) {
      options.push({
        value: wardrobe[wi],
        label: String(wardrobe[wi])
      });
    }
    var choices = [{
      choiceId: "prep_pick",
      label: "就决定是你了！",
      primary: true
    }, {
      choiceId: "prep_skip",
      label: "还是算了，游客，启动！"
    }];
    if (state.run.isTourist) {
      choices[0].disabled = true;
      choices[0].disabledHint = "你在此之前已经选择了以游客的形式参与";
    }
    return setGameNode(state, {
      nodeId: "event_prep",
      title: "展前准备",
      text: "马上就要出发了，是出很美丽的cos，还是只是做一个普通游客呢？\n下拉菜单中选择你已经拥有的cos。",
      select: {
        label: "选择cos服",
        options: options.length ? options : [{
          value: "",
          label: "（无可选cos）"
        }]
      },
      choices: choices
    });
  }
  function enterPhaseD1(state) {
    state.phaseId = "D-1";
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setGameNodeParentCaughtEnding(state);
    }
    state.run.energy = 100;
    state.energy = 100;
    var mode = state.run.travelMode;
    var delta = mode === "selfDrive" ? -30 : mode === "hardSeat" ? -60 : mode === "highSpeedRail" ? -30 : mode === "flight" ? -20 : 0;
    state.run.energy = clamp01to100(state.run.energy + delta);
    updateHudText(state);
    if (checkAndEndLoveYourselfIfNeeded(state)) return;
    setGameNode(state, {
      nodeId: "event_to_venue",
      title: "马O途中",
      text: "你通过" + modeLabel(mode) + "，经过了几个小时的路程之后，终于到达了省城。\n看着省城里的高楼大厦，你很感慨。你也梦想着有朝一日，能够在这样的大城市里生活。",
      choices: [{
        choiceId: "to_venue_arrive",
        label: "到达目的地",
        primary: true
      }]
    });
  }
  function modeLabel(mode) {
    if (mode === "selfDrive") return "自驾";
    if (mode === "hardSeat") return "硬座";
    if (mode === "highSpeedRail") return "高铁";
    if (mode === "flight") return "飞机";
    return "未知交通";
  }
  function enterEventDinner(state) {
    return setGameNode(state, {
      nodeId: "event_dinner",
      title: "晚餐时间",
      text: "你终于到了省城，舟车劳顿之后你感到很饿。\n掏出手机，你打开「饱了吗」App，发现这里的饭菜远比那个小县城里要丰富上数倍。",
      choices: [{
        choiceId: "dinner_barbeque",
        label: "用饱了吗App点餐：自助烤肉（精力+40，金钱-80）",
        primary: true
      }, {
        choiceId: "dinner_mcn",
        label: "用饱了吗App点餐：麦肯王（精力+20，金钱-40）"
      }, {
        choiceId: "dinner_mala",
        label: "用饱了吗App点餐：张福麻辣烫（精力+10，金钱-20）"
      }, {
        choiceId: "dinner_skip",
        label: "好贵，还是算了（精力-20）"
      }]
    });
  }
  function enterEventHotel(state) {
    var hotelId = state.run.hotelId;
    return setGameNode(state, {
      nodeId: "event_hotel",
      title: "入住酒店",
      text: "吃过晚饭，你入住了" + hotelIdLabel(hotelId) + "。你放下背包，简单洗了个澡，准备睡觉。\n你此刻感觉充满了信心。",
      choices: [{
        choiceId: "hotel_next_day",
        label: "迎接第二天",
        primary: true
      }]
    });
  }
  function hotelIdLabel(hotelId) {
    var map = {
      RuSiHaoWeiDeng: "瑞思豪威登",
      HuaTing40: "华庭4.0",
      RuLaiJingXuan: "如来精选",
      HuaJiaoHotel: "花椒酒店"
    };
    return map[hotelId] || String(hotelId || "-");
  }
  function enterPhaseMorning(state) {
    state.phaseId = "那一天的早上";
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setGameNodeParentCaughtEnding(state);
    }
    if (isOffice(state.role) && state.run.specialId !== "none") {
      var p2 = specialProbForOffice(state.run.specialId);
      if (Math.random() < p2) return setEnding(state, "workWhy");
    }
    var hasCos = state.run.backpackCosplays.length > 0;
    var hasMakeupBooked = !!state.run.makeupBookedTime;
    var choices = [];
    if (!hasCos && !hasMakeupBooked) {
      choices.push({
        choiceId: "morning_direct",
        label: "直接出发",
        primary: true
      });
    }
    if (hasCos && !hasMakeupBooked) {
      choices.push({
        choiceId: "morning_prepare",
        label: "换上cos服，准备出发",
        primary: true
      });
    }
    if (hasCos && hasMakeupBooked) {
      choices.push({
        choiceId: "morning_makeup",
        label: "换上cos服，前往化妆",
        primary: true
      });
    }
    if (!choices.length) {
      choices.push({
        choiceId: "morning_direct_fallback",
        label: "直接出发",
        primary: true
      });
    }
    return setGameNode(state, {
      nodeId: "event_morning",
      title: "那一天的早上",
      text: "早上起来，你看着楼下三三两两地出现了一些coser，你很开心，你也想加入他们，可你和他们......真的很熟吗？",
      choices: choices
    });
  }
  function enterEventToMakeup(state) {
    if (Math.random() < 1 / 30) {
      return setGameNode(state, {
        nodeId: "event_makeup_runaway",
        title: "妆娘跑路了！",
        text: "你和其他找这位妆娘化妆的同好们集体在酒店楼下傻了眼，因为你们发现，无论是微信语音还是电话，没有一样可以接通。\n最终你和他们傻等了两个小时，只好顶着一张没化过妆的脸赶去马娘Only的现场，并希望不要被人头套扯一地。",
        choices: [{
          choiceId: "makeup_runaway_grit",
          label: "硬着头皮，挤上地铁",
          primary: true
        }]
      });
    }
    return setGameNode(state, {
      nodeId: "event_go_makeup",
      title: "前往化妆",
      text: "你来到化妆师所在的地方，这是你第一次被别人化妆，你感觉是很新奇的体验。",
      choices: [{
        choiceId: "makeup_done",
        label: "化妆完成，准备出发",
        primary: true
      }]
    });
  }
  function getMakeupEnergyDelta(bookedTime) {
    return bookedTime === 7 ? -30 : bookedTime === 8 ? -15 : bookedTime === 9 ? -10 : 0;
  }
  function enterEventAfterMakeup(state) {
    var bookedTime = state.run.makeupBookedTime;
    var energyDelta = getMakeupEnergyDelta(bookedTime);
    var energyText = energyDelta === 0 ? "你的精力值没有变化。" : "你的精力值" + energyDelta + "。";
    return setGameNode(state, {
      nodeId: "event_after_makeup",
      title: "化妆完成",
      text: "化妆结束后，你看着镜子里的自己，心情复杂又有点兴奋。\n你预约的是当天" + bookedTime + ":00的化妆，整个化妆过程花费了1个小时。" + energyText,
      choices: [{
        choiceId: "after_makeup_depart",
        label: "准备出发",
        primary: true
      }]
    });
  }
  function applyMakeupEnergyAndTime(state) {
    var time = state.run.makeupBookedTime;
    var energyDelta = getMakeupEnergyDelta(time);
    state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) + energyDelta);
    state.run.timeMinutes = time * 60 + 60;
    state.run.makeupDone = true;
  }
  function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
  }
  var DICE_FACES = ["\u2680", "\u2681", "\u2682", "\u2683", "\u2684", "\u2685"];
  function enterDiceRoll(state, opts) {
    state.run.pendingDice = {
      onWin: opts.onWin,
      onLose: opts.onLose,
      onDraw: opts.onDraw
    };
    setGameNode(state, {
      nodeId: "dice_roll",
      title: opts.title,
      text: "你决定正面应对，和对方来一场骰子对决。",
      choices: [{
        choiceId: "dice_roll_go",
        label: "掷骰子！",
        primary: true
      }]
    });
  }
  function enterDiceResult(state, playerRoll, opponentRoll) {
    var resultKey;
    if (playerRoll > opponentRoll) resultKey = "onWin";else if (playerRoll < opponentRoll) resultKey = "onLose";else resultKey = "onDraw";
    var next = state.run.pendingDice[resultKey];
    var desc = playerRoll > opponentRoll ? "你赢了！" : playerRoll < opponentRoll ? "你输了......" : "平局。";
    setGameNode(state, {
      nodeId: "dice_result",
      title: "骰子结果",
      text: "你掷出了 " + DICE_FACES[playerRoll - 1] + playerRoll + "，对手掷出了 " + DICE_FACES[opponentRoll - 1] + opponentRoll + "。\n" + desc,
      choices: [{
        choiceId: "dice_result_next",
        label: "继续",
        primary: true,
        payload: next
      }]
    });
  }
  function enterPhaseSubway(state) {
    state.phaseId = "在地铁上";
    if (state.run.timeMinutes == null) state.run.timeMinutes = 9 * 60;
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setEnding(state, "hopeMature");
    }
    if (isOffice(state.role) && state.run.specialId !== "none") {
      var p2 = specialProbForOffice(state.run.specialId);
      if (Math.random() < p2) return setEnding(state, "workWhy");
    }
    var gender = state.run.gender;
    var trigger10 = Math.random() < 0.5;
    var nextNode = "wind";
    if (trigger10) {
      if (gender === 0) {
        nextNode = Math.random() < 0.8 ? "not_man_woman" : "wind";
      } else {
        nextNode = Math.random() < 0.8 ? "man_encounter" : "wind";
      }
    }
    if (nextNode === "not_man_woman") return enterEventNotManWoman(state);
    if (nextNode === "man_encounter") return enterEventManFlirt(state);
    return enterEventWind(state);
  }
  function enterEventNotManWoman(state) {
    return setGameNode(state, {
      nodeId: "event_not_man_woman",
      title: "不男不女",
      text: "你穿着赛马娘的cos服，这时一个看起来不怀好意的老大爷走过来，突然指着你，质问你「男的女的？穿这种日本动漫的衣服干什么？你是什么目的？」",
      choices: [{
        choiceId: "not_man_woman_ignore",
        label: "不予理会（精力值-10）",
        primary: true
      }, {
        choiceId: "not_man_woman_explain",
        label: "试图说明（？？？）"
      }]
    });
  }
  function enterEventManFlirt(state) {
    return setGameNode(state, {
      nodeId: "event_man_flirt",
      title: "被男性搭讪",
      text: "你穿着赛马娘的cos服，这时一个看起来不怀好意的男子走过来，贴近了你的身体，问你「小姐姐是不是玩cos的？加个好友，能处对象吗？」",
      choices: [{
        choiceId: "man_flirt_ignore",
        label: "不予理会（精力值-10）",
        primary: true
      }, {
        choiceId: "man_flirt_refuse",
        label: "试图拒绝（？？？）"
      }]
    });
  }
  function enterEventWind(state) {
    return setGameNode(state, {
      nodeId: "event_wind",
      title: "风平浪静",
      text: "你在路上很幸运地没有受到异样的眼光，安全抵达了现场。",
      choices: [{
        choiceId: "wind_get_off",
        label: "进入地点",
        primary: true
      }]
    });
  }
  function enterPhaseOnlyWelcome(state) {
    state.phaseId = "欢迎来到马娘Only";
    if (state.run.recognition == null) {
      state.run.recognition = 50;
    }
    updateHudText(state);
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setEnding(state, "hopeMature");
      if (state.run.timeMinutes != null) state.run.timeMinutes += 60;
      if (Math.random() < p) return setEnding(state, "hopeMature");
    }
    if (isOffice(state.role) && state.run.specialId !== "none") {
      var p2 = specialProbForOffice(state.run.specialId);
      if (Math.random() < p2) return setEnding(state, "workWhy");
      if (state.run.timeMinutes != null) state.run.timeMinutes += 60;
      if (Math.random() < p2) return setEnding(state, "workWhy");
    }
    if (state.run.timeMinutes < 10 * 60) {
      return setGameNode(state, {
        nodeId: "node_wait",
        title: "稍作等待",
        text: "现在时间是" + formatTimeHHMM(state.run.timeMinutes) + "，你决定稍作等待，等到10点准时进入。",
        choices: [{
          choiceId: "wait_set_10",
          label: "继续",
          primary: true
        }]
      });
    }
    return enterExhibitionEvent(state);
  }
  function calcEasterWeight(missCount) {
    return Math.min(1 + missCount * 5, 30);
  }
  function enterExhibitionEvent(state) {
    if (state.run.timeMinutes >= 18 * 60) {
      return enterPhaseAfterOnly(state);
    }
    state.run.recognition = clamp01to100((state.run.recognition != null ? state.run.recognition : 0) - 2);
    updateHudText(state);
    if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
    var eventId = weightedPick([{
      id: "wind",
      weight: 2
    }, {
      id: "post",
      weight: 55
    }, {
      id: "great_creator",
      weight: 10
    }, {
      id: "stage_program",
      weight: 10
    }, {
      id: "expansion",
      weight: 10
    }, {
      id: "paincar_approved",
      weight: 10
    }, {
      id: "no_makeup",
      weight: 10
    }, {
      id: "pixel_easter",
      weight: calcEasterWeight(state.pixelMissCount != null ? state.pixelMissCount : 0)
    }, {
      id: "zoom_zoom",
      weight: calcEasterWeight(state.zoomMissCount != null ? state.zoomMissCount : 0)
    }], Math.random);
    var variant = resolveExhibitionEventVariant(state, eventId);
    var isEasterEgg = variant.nodeId === "ex_has_pin" || variant.nodeId === "ex_zoom_zoom";
    var autoDisableMs = variant.nodeId === "ex_stage_program" ? 3000 : isEasterEgg ? 3000 : 0;
    var nodeOpts = {
      nodeId: variant.nodeId,
      title: variant.title,
      text: formatText(variant.text, {
        cosplay: getCosplayFromBackpackOrPlaceholder(state, "（未知服装）"),
        painCarModel: state.run.painCarLabel,
        painCarStyle: state.run.painCarStyle
      }),
      choices: variant.choices
    };
    if (autoDisableMs > 0) nodeOpts.autoDisableMs = autoDisableMs;
    setGameNode(state, nodeOpts);
    if (variant.nodeId === "ex_zoom_zoom") {
      playBgm(AUDIO_MAP.zoomZoom);
    }
    if (variant.nodeId === "ex_stage_program") {
      playBgm(AUDIO_MAP.umaTracks[Math.floor(Math.random() * AUDIO_MAP.umaTracks.length)]);
    }
    return;
  }
  function resolveExhibitionEventVariant(state, eventId) {
    formatTimeHHMM(state.run.timeMinutes != null ? state.run.timeMinutes : 0);
    var backpackHasCos = hasBackpackCosplay(state);
    state.run.painCarId && state.run.painCarId !== "none";
    var selfDrive = state.run.travelMode === "selfDrive";
    var wind = {
      nodeId: "ex_wind",
      title: "风平浪静",
      text: "这段时间似乎什么都没发生，你选择继续游场。",
      choices: [{
        choiceId: "ex_wind_continue",
        label: "继续游场（认可度-5）",
        primary: true
      }]
    };
    if (eventId === "wind") return wind;
    if (eventId === "post") {
      if (!backpackHasCos) {
        return {
          nodeId: "ex_teacher_post_cond",
          title: "可以和老师集邮吗？",
          text: "你看到了一个coser，觉得他很好看，你想要和他合影。",
          choices: [{
            choiceId: "ex_post2_btn1",
            label: "合影并递上周边（认可度+3，周边数量-1）",
            primary: true,
            requiresBadges: 1
          }, {
            choiceId: "ex_post2_btn2",
            label: "合影（认可度+1）"
          }, {
            choiceId: "ex_post2_btn3",
            label: "还是不了（认可度-5）"
          }]
        };
      }
      return {
        nodeId: "ex_post",
        title: "被集邮了！",
        text: "有人觉得你cos的{{cosplay}}很好看，他想要和你合影。",
        choices: [{
          choiceId: "ex_post_btn1",
          label: "合影并递上周边（认可度+5，周边数量-1）",
          primary: true,
          requiresBadges: 1
        }, {
          choiceId: "ex_post_btn2",
          label: "合影（认可度+3）"
        }, {
          choiceId: "ex_post_btn3",
          label: "还是不了（认可度-5）"
        }]
      };
    }
    if (eventId === "great_creator") {
      return {
        nodeId: "ex_great_creator",
        title: "很棒的同人老师",
        text: "你遇到了一个你十分喜欢的同人摊位，角色和风格都很戳你，这让你想要购买。",
        choices: [{
          choiceId: "ex_great_btn1",
          label: "立即购买（认可度+10，金钱-20）",
          primary: true
        }, {
          choiceId: "ex_great_btn2",
          label: "还是不了"
        }]
      };
    }
    if (eventId === "stage_program") {
      return {
        nodeId: "ex_stage_program",
        title: "喜欢的舞台节目",
        text: "你看到了非常喜欢的舞台节目，他的舞姿如此有张力，以至于你感到精神都升华到了新的境界。",
        choices: [{
          choiceId: "ex_stage_btn1",
          label: "\u304D\u307F\u306E\u611B\u99AC\u304C!",
          primary: true
        }]
      };
    }
    if (eventId === "expansion") {
      return {
        nodeId: "ex_expansion",
        title: "扩列了！",
        text: "你遇到了一位同人作者，她递给你一份无料，其中的自我介绍，你觉得这是一个很有态度的人......",
        choices: [{
          choiceId: "ex_expansion_btn1",
          label: "加好友并交换周边（认可度+10，周边数量-1）",
          primary: true,
          requiresBadges: 1
        }, {
          choiceId: "ex_expansion_btn3",
          label: "加好友（认可度+3）"
        }, {
          choiceId: "ex_expansion_btn2",
          label: "还是不了（认可度-5）"
        }]
      };
    }
    if (eventId === "paincar_approved") {
      if (!selfDrive) {
        var painCar = CAR_MODELS[randInt(0, CAR_MODELS.length - 1)];
        var painCarLabel = getCarLabel(painCar.id);
        var painUma = UMA_NAMES[randInt(0, UMA_NAMES.length - 1)];
        return {
          nodeId: "ex_paincar_unapproved",
          title: "这车真帅吧",
          text: "你看到了一辆" + painCarLabel + "的" + painUma + "痛车，非常喜欢。你对车主表达了赞叹，并想要拍一张照片。",
          choices: [{
            choiceId: "ex_pain_btn1",
            label: "拍照并递上周边（认可度+5，周边数量-1）",
            primary: true,
            requiresBadges: 1
          }, {
            choiceId: "ex_pain_btn2",
            label: "拍照（认可度+1）"
          }, {
            choiceId: "ex_pain_btn3",
            label: "还是不了（认可度-5）"
          }]
        };
      }
      return {
        nodeId: "ex_paincar_approved",
        title: "痛车得到认可",
        text: "你的{{painCarModel}}的{{painCarStyle}}痛车得到了极大的认可，有coser和你的痛车合影，而且还大赞你的痛车十分有品。",
        choices: [{
          choiceId: "ex_pain_approved_btn1",
          label: "感谢他（认可度+10）",
          primary: true
        }]
      };
    }
    if (eventId === "no_makeup") {
      var cosInBackpack = backpackHasCos;
      var makeupDone = !!state.run.makeupDone;
      var first = !(state.run.flags && state.run.flags.noMakeupFirstUsed);
      if (!cosInBackpack && !makeupDone) {
        return wind;
      }
      if (cosInBackpack && makeupDone) {
        return {
          nodeId: "ex_wrong_eyes",
          title: "奇怪的眼神",
          text: "有人觉得你cos的{{cosplay}}不还原，和同伴小声嘀咕，意图将你挂到网上。",
          choices: [{
            choiceId: "ex_wrong_btn1",
            label: "掷骰子！",
            primary: true
          }, {
            choiceId: "ex_wrong_btn2",
            label: "不阻止（认可度-40）"
          }, {
            choiceId: "ex_wrong_btn3",
            label: "呼叫保安（认可度-20，精力值-20）"
          }]
        };
      }
      if (cosInBackpack && !makeupDone) {
        if (!first) return wind;
        state.run.flags.noMakeupFirstUsed = true;
        return {
          nodeId: "ex_no_makeup",
          title: "没化妆......",
          text: "有人发现你没化妆，于是他当场指责你，说你毁了他推的形象，他很生气，甚至马上要把你的假发扒下来。",
          choices: [{
            choiceId: "ex_no_makeup_btn1",
            label: "跑！（认可度-50）",
            primary: true
          }, {
            choiceId: "ex_no_makeup_btn2",
            label: "掷骰子！"
          }, {
            choiceId: "ex_no_makeup_btn3",
            label: "呼叫保安（认可度-20，精力值-20）"
          }]
        };
      }
      return wind;
    }
    if (eventId === "pixel_easter") {
      var good = isPhonePixel(state);
      if (!good || state.run.flags && state.run.flags.easterHasPinUsed) return wind;
      state.run.flags.easterHasPinUsed = true;
      state.pixelMissCount = 0;
      return {
        nodeId: "ex_has_pin",
        title: "有品！",
        text: "有人看到了你用Pixel手机，感觉你十分有品。想要和你扩列。",
        choices: [{
          choiceId: "ex_has_pin_btn1",
          label: "加好友并交换周边（认可度+50，周边数量-1）",
          primary: true,
          requiresBadges: 1
        }, {
          choiceId: "ex_has_pin_btn2",
          label: "还是不了"
        }]
      };
    }
    if (eventId === "zoom_zoom") {
      var mazda = isPainCarMazda(state);
      var sd = state.run.travelMode === "selfDrive";
      var used = !!(state.run.flags && state.run.flags.easterZoomZoomUsed);
      console.log("[zoom_zoom] mazda=%s sd=%s used=%s label=%s mode=%s", mazda, sd, used, state.run.painCarLabel, state.run.travelMode);
      var ok = mazda && sd;
      if (!ok || used) return wind;
      state.run.flags.easterZoomZoomUsed = true;
      state.zoomMissCount = 0;
      return {
        nodeId: "ex_zoom_zoom",
        title: "Zoom-Zoom",
        text: "有人看到了你{{painCarModel}}的{{painCarStyle}}痛车，对方恰好也是个马自达车主，想要和你扩列。",
        choices: [{
          choiceId: "ex_zoom_btn1",
          label: "加好友并交换周边（认可度+50，周边数量-1）",
          primary: true,
          requiresBadges: 1
        }, {
          choiceId: "ex_zoom_btn2",
          label: "还是不了"
        }]
      };
    }
    return wind;
  }
  function enterPhaseAfterOnly(state) {
    state.phaseId = "马O之后";
    if (isHighSchool(state.role) && state.run.specialId !== "none") {
      var p = specialProbForParent(state.role.specialId);
      if (Math.random() < p) return setEnding(state, "hopeMature");
    }
    if (isOffice(state.role) && state.run.specialId !== "none") {
      var p2 = specialProbForOffice(state.run.specialId);
      if (Math.random() < p2) return setEnding(state, "workWhy");
    }
    return setGameNode(state, {
      nodeId: "event_after_only_dinner",
      title: "要聚餐吗",
      text: "刚刚结束了的马娘Only，大家似乎意犹未尽，于是有人提议去聚餐。你刚刚认识的新朋友也要拉着你一起。",
      choices: [{
        choiceId: "after_dinner_yes",
        label: "去！（金钱-50，精力值+30，认可值+10）",
        primary: true
      }, {
        choiceId: "after_dinner_no",
        label: "不去！"
      }]
    });
  }
  function enterPhaseGoHome(state) {
    state.phaseId = "各回各家";
    var mode = state.run.travelMode;
    var delta = mode === "selfDrive" ? -30 : mode === "hardSeat" ? -60 : mode === "highSpeedRail" ? -30 : mode === "flight" ? -20 : 0;
    state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) + delta);
    updateHudText(state);
    if (checkAndEndLoveYourselfIfNeeded(state)) return;
    return setGameNode(state, {
      nodeId: "event_go_home",
      title: "各回各家",
      text: "你通过" + modeLabel(mode) + "，经过了几个小时的路程之后，终于回到了小县城。\n回想着今天经历的一切，你的泪水慢慢地滑了出来。你不知道以后还有没有机会和他们见面。",
      choices: [{
        choiceId: "home_arrive_end",
        label: "到达目的地",
        primary: true
      }]
    });
  }
  function resolveEndByRecognition(state) {
    var r = state.run.recognition != null ? state.run.recognition : 0;
    if (r <= 0) return setEnding(state, "noOneLikesMe");
    if (r >= 80) return setEnding(state, "superStar");
    if (r >= 50) return setEnding(state, "nextTime");
    if (r >= 20) return setEnding(state, "somewhatLost");
    return setEnding(state, "realSomeoneLikesYou");
  }
  function applyHotelEnergy(state) {
    var delta = getHotelEnergyDelta(state.run.hotelId);
    state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) + delta);
  }

  // ── Main action handler ──────────────────────────────────────────
  function dispatch(actionId, ctx) {
    if (!ctx) ctx = {};
    var state = window.__maoState;
    if (!state) return;
    if (!state.actionsLog) state.actionsLog = [];
    state.actionsLog.push({
      time: new Date().toISOString(),
      screen: state.screen,
      nodeId: state.nodeId,
      action: actionId
    });
    if (actionId === "modal_confirm") {
      setModal(false);
      return render(state);
    }
    if (actionId === "restart") {
      stopBgm();
      window.__maoState = createDefaultState();
      bindUI({
        onAction: dispatch
      });
      render(window.__maoState);
      return;
    }
    if (state.screen === "mainMenu") {
      if (actionId === "start_role_select") {
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
        render(state);
      }
      return;
    }
    if (state.screen === "roleSelect") {
      if (actionId === "roll_role" || actionId === "roll_role_again") {
        if (actionId === "roll_role_again") state.rerollCount = (state.rerollCount != null ? state.rerollCount : 0) + 1;
        var genderVal = state.genderSelect != null ? state.genderSelect : 0;
        state.role = createRoleSelection(genderVal, Math.random);
        render(state);
      }
      if (actionId === "select_gender") {
        var val = Number(ctx.payload);
        state.genderSelect = val === 0 || val === 1 ? val : null;
        state.role = createRoleSelection(state.genderSelect, Math.random);
        render(state);
      }
      if (actionId === "dismiss_der") {
        state.derDismissed = true;
        render(state);
      }
      if (actionId === "enter_game") {
        if (!(state.role && state.role.frozen)) return;
        if (state.genderSelect == null) {
          setModal(true, {
            title: "错误",
            body: "您还未选择性别，请选择一个性别来继续游戏。",
            confirmLabel: "好"
          });
          return;
        }
        stopBgm();
        state.run = createRunStateFromRole(state.role);
        state.energy = null;
        state.recognition = null;
        state.timeMinutes = null;
        state.screen = "game";
        enterPhaseD30(state);
      }
      return;
    }
    if (state.screen === "ending") {
      return;
    }
    if (state.screen === "game") {
      switch (state.nodeId) {
        case "good_want_enzao_gate":
          if (actionId === "choice_good_want_go") return enterShopEnzao(state);
          if (actionId === "choice_good_want_skip") return setEnding(state, "neverStartDream");
          break;
        case "shop_enzao":
          if (actionId === "shop_enzao_buy_badges") {
            if (!requireMoneyOrModal(state, 50)) return;
            state.run.backpackBadges += 10;
            state.run.money -= 50;
            return enterPhaseD14(state);
          }
          if (actionId === "shop_enzao_skip") return enterPhaseD14(state);
          break;
        case "event_role_choice":
          if (actionId === "choice_role_skip") return enterPhaseD10(state);
          if (actionId === "choice_role_buy") return enterShopTaobao(state);
          break;
        case "shop_taobao":
          if (actionId === "shop_taobao_skip") return enterPhaseD10(state);
          if (actionId === "shop_taobao_reroll") return enterShopTaobao(state);
          if (actionId.indexOf("buy_cos_") === 0) {
            var idx = parseInt(actionId.replace("buy_cos_", ""), 10);
            var name = state.run.shopCosOptions && state.run.shopCosOptions[idx];
            if (!name) break;
            if (!requireMoneyOrModal(state, 500)) return;
            state.run.wardrobeCosplays.push(name);
            state.run.money -= 500;
            return enterPhaseD10(state);
          }
          break;
        case "event_makeup_choice":
          if (actionId === "choice_makeup_no") {
            setModal(true, {
              title: "提示",
              body: "确定不约妆吗？这之后你将以游客形态去到马娘Only。",
              confirmLabel: "正合我意",
              cancelLabel: "我再想想",
              onConfirm: function onConfirm() {
                setModal(false);
                state.run.isTourist = true;
                enterPhaseD7(state);
              }
            });
            return;
          }
          if (actionId === "choice_makeup_yes") {
            setModal(true, {
              title: "提示",
              body: "确定约妆吗？这之后你将以coser形态去到马娘Only。",
              confirmLabel: "正合我意",
              cancelLabel: "我再想想",
              onConfirm: function onConfirm() {
                setModal(false);
                enterShopMakeup(state);
              }
            });
            return;
          }
          break;
        case "shop_makeup":
          if (actionId === "shop_makeup_skip") return enterPhaseD7(state);
          if (actionId === "makeup_7") {
            if (!requireMoneyOrModal(state, 40)) return;
            state.run.makeupBookedTime = 7;
            state.run.money -= 40;
            return enterPhaseD7(state);
          }
          if (actionId === "makeup_8") {
            if (!requireMoneyOrModal(state, 50)) return;
            state.run.makeupBookedTime = 8;
            state.run.money -= 50;
            return enterPhaseD7(state);
          }
          if (actionId === "makeup_9") {
            if (!requireMoneyOrModal(state, 60)) return;
            state.run.makeupBookedTime = 9;
            state.run.money -= 60;
            return enterPhaseD7(state);
          }
          if (actionId === "makeup_10") {
            if (!requireMoneyOrModal(state, 80)) return;
            state.run.makeupBookedTime = 10;
            state.run.money -= 80;
            return enterPhaseD7(state);
          }
          break;
        case "event_paincar_open":
          if (actionId === "paincar_open") {
            if (!requireMoneyOrModal(state, 200)) return;
            state.run.travelMode = "selfDrive";
            state.run.money -= 200;
            return enterPhaseD5(state);
          }
          if (actionId === "paincar_close") return enterNodeTravelMode(state);
          break;
        case "event_travel_mode":
          if (actionId === "travel_open_app") return enterShopNotShunLu(state);
          if (actionId === "travel_too_expensive") return setEnding(state, "neverStartDream");
          break;
        case "shop_not_shunlu":
          if (actionId === "ticket_skip") return setEnding(state, "neverStartDream");
          if (actionId === "ticket_highspeed") {
            if (!requireMoneyOrModal(state, 200)) return;
            state.run.travelMode = "highSpeedRail";
            state.run.money -= 200;
            return enterPhaseD5(state);
          }
          if (actionId === "ticket_flight") {
            if (!requireMoneyOrModal(state, 500)) return;
            state.run.travelMode = "flight";
            state.run.money -= 500;
            return enterPhaseD5(state);
          }
          if (actionId === "ticket_hardseat") {
            if (!requireMoneyOrModal(state, 50)) return;
            state.run.travelMode = "hardSeat";
            state.run.money -= 50;
            return enterPhaseD5(state);
          }
          break;
        case "event_hotel_choice":
          if (actionId === "hotel_open_app") return enterShopGoWhere(state);
          if (actionId === "hotel_too_expensive") return setEnding(state, "neverStartDream");
          break;
        case "shop_bu_qu_nar":
          if (actionId === "hotel_skip") return setEnding(state, "neverStartDream");
          if (actionId === "hotel_huaJiao") {
            if (!requireMoneyOrModal(state, 80)) return;
            state.run.hotelId = "HuaJiaoHotel";
            state.run.money -= 80;
            return enterPhaseD3(state);
          }
          if (actionId === "hotel_ruLai") {
            if (!requireMoneyOrModal(state, 100)) return;
            state.run.hotelId = "RuLaiJingXuan";
            state.run.money -= 100;
            return enterPhaseD3(state);
          }
          if (actionId === "hotel_huaTing") {
            if (!requireMoneyOrModal(state, 200)) return;
            state.run.hotelId = "HuaTing40";
            state.run.money -= 200;
            return enterPhaseD3(state);
          }
          if (actionId === "hotel_ruSi") {
            if (!requireMoneyOrModal(state, 500)) return;
            state.run.hotelId = "RuSiHaoWeiDeng";
            state.run.money -= 500;
            return enterPhaseD3(state);
          }
          break;
        case "event_prep":
          if (actionId === "prep_skip") {
            if (state.run.makeupBookedTime == null) return enterPhaseD1(state);
            setModal(true, {
              title: "提醒",
              body: "可是你已经约了化妆师诶……",
              confirmLabel: "确认"
            });
            return;
          }
          if (actionId === "prep_pick") {
            if (state.run.isTourist && ctx.disabledClick) {
              setModal(true, {
                title: "提示",
                body: "你在此之前已经选择了以游客的形式参与。",
                confirmLabel: "好"
              });
              return;
            }
            var selected = ctx.selectedValue;
            if (!selected) return enterPhaseD1(state);
            var selIdx = state.run.wardrobeCosplays.indexOf(selected);
            if (selIdx >= 0) {
              state.run.wardrobeCosplays.splice(selIdx, 1);
              state.run.backpackCosplays.push(selected);
            }
            return enterPhaseD1(state);
          }
          break;
        case "event_to_venue":
          if (actionId === "to_venue_arrive") return enterEventDinner(state);
          break;
        case "event_dinner":
          if (actionId === "dinner_skip") {
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) - 20);
            updateHudText(state);
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            return enterEventHotel(state);
          }
          if (actionId === "dinner_barbeque") {
            if (!requireMoneyOrModal(state, 80)) return;
            state.run.money -= 80;
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) + 40);
            updateHudText(state);
            return enterEventHotel(state);
          }
          if (actionId === "dinner_mcn") {
            if (!requireMoneyOrModal(state, 40)) return;
            state.run.money -= 40;
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) + 20);
            updateHudText(state);
            return enterEventHotel(state);
          }
          if (actionId === "dinner_mala") {
            if (!requireMoneyOrModal(state, 20)) return;
            state.run.money -= 20;
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) + 10);
            updateHudText(state);
            return enterEventHotel(state);
          }
          break;
        case "event_hotel":
          if (actionId === "hotel_next_day") {
            applyHotelEnergy(state);
            updateHudText(state);
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            return enterPhaseMorning(state);
          }
          break;
        case "event_morning":
          if (actionId === "morning_direct" || actionId === "morning_direct_fallback") {
            state.run.timeMinutes = 9 * 60;
            return enterPhaseSubway(state);
          }
          if (actionId === "morning_prepare") {
            state.run.timeMinutes = 9 * 60;
            return enterPhaseSubway(state);
          }
          if (actionId === "morning_makeup") {
            return enterEventToMakeup(state);
          }
          break;
        case "event_makeup_runaway":
          if (actionId === "makeup_runaway_grit") {
            state.run.makeupDone = false;
            var bookedBase = (state.run.makeupBookedTime != null ? state.run.makeupBookedTime : 9) * 60;
            state.run.timeMinutes = bookedBase + 120;
            updateHudText(state);
            return enterPhaseSubway(state);
          }
          break;
        case "event_go_makeup":
          if (actionId === "makeup_done") {
            applyMakeupEnergyAndTime(state);
            updateHudText(state);
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            return enterEventAfterMakeup(state);
          }
          break;
        case "event_after_makeup":
          if (actionId === "after_makeup_depart") {
            return enterPhaseSubway(state);
          }
          break;
        case "event_not_man_woman":
          if (actionId === "not_man_woman_ignore") {
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) - 10);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            return enterPhaseOnlyWelcome(state);
          }
          if (actionId === "not_man_woman_explain") {
            var hit1 = Math.random() < 0.7;
            if (hit1) {
              return setGameNode(state, {
                nodeId: "event_do_whatever",
                title: "干什么！",
                text: "对方丝毫不理会你，甚至被你的行为激怒了，在一阵怒吼之后，他扑上来大喊「你是不是男的？是不是没长那玩意？我现在就把你的衣服扒下来！」，此时你意识到不对，凭借体力优势，将其控制在地上。这时，乘警来到了你的附近......",
                choices: [{
                  choiceId: "do_whatever_help",
                  label: "协助调查",
                  primary: true
                }]
              });
            }
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) - 20);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            return enterPhaseOnlyWelcome(state);
          }
          break;
        case "event_man_flirt":
          if (actionId === "man_flirt_ignore") {
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) - 10);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            return enterPhaseOnlyWelcome(state);
          }
          if (actionId === "man_flirt_refuse") {
            var hit2 = Math.random() < 0.7;
            if (hit2) {
              return setGameNode(state, {
                nodeId: "event_brave_no",
                title: "勇敢说不",
                text: "对方丝毫不理会你，开始伸出手来，此时你意识到不对，因为学过跆拳道的原因，你成功将其控制在地上。这时，乘警来到了你的附近......",
                choices: [{
                  choiceId: "brave_no_help",
                  label: "协助调查",
                  primary: true
                }]
              });
            }
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) - 20);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            return enterPhaseOnlyWelcome(state);
          }
          break;
        case "event_do_whatever":
          if (actionId === "do_whatever_help") return setEnding(state, "selfDefense");
          break;
        case "event_brave_no":
          if (actionId === "brave_no_help") return setEnding(state, "braveGirl");
          break;
        case "event_wind":
          if (actionId === "wind_get_off") {
            state.run.timeMinutes += 30;
            updateHudText(state);
            return enterPhaseOnlyWelcome(state);
          }
          break;
        case "node_wait":
          if (actionId === "wait_set_10") {
            state.run.timeMinutes = 10 * 60;
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_wind":
          if (actionId === "ex_wind_continue") {
            state.run.recognition = clamp01to100(state.run.recognition - 5);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_post":
          if (actionId === "ex_post_btn1") {
            state.run.recognition = clamp01to100(state.run.recognition + 5);
            state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_post_btn2") {
            state.run.recognition = clamp01to100(state.run.recognition + 3);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_post_btn3") {
            state.run.recognition = clamp01to100(state.run.recognition - 5);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_teacher_post_cond":
          if (actionId === "ex_post2_btn1") {
            state.run.recognition = clamp01to100(state.run.recognition + 3);
            state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_post2_btn2") {
            state.run.recognition = clamp01to100(state.run.recognition + 1);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_post2_btn3") {
            state.run.recognition = clamp01to100(state.run.recognition - 5);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_great_creator":
          if (actionId === "ex_great_btn1") {
            if (!requireMoneyOrModal(state, 20)) return;
            state.run.recognition = clamp01to100(state.run.recognition + 10);
            state.run.money -= 20;
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_great_btn2") {
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_stage_program":
          if (actionId === "ex_stage_btn1") {
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) + 10);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_expansion":
          if (actionId === "ex_expansion_btn1") {
            var proceedExpansion = function proceedExpansion() {
              state.run.recognition = clamp01to100(state.run.recognition + 10);
              state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
              state.run.timeMinutes += 30;
              updateHudText(state);
              if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
              if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
              return enterExhibitionEvent(state);
            };
            if (Math.random() < 0.5) {
              setModal(true, {
                title: "关注我们",
                htmlBody: '首先感谢您游玩我们的游戏，您的支持就是我们最大的动力。<br><br>' + '如果您对我们的社团有着进一步的兴趣，可以通过以下方式掌握我们的最新动态：<br><br>' + 'QQ群：308610161 <a href="https://qm.qq.com/q/YQvlAiqniU" target="_blank">点击添加</a><br>' + '小红书账号：ADEquipOfficial <a href="https://www.xiaohongshu.com/user/profile/685c15dc000000001b019187" target="_blank">点击前往</a>',
                confirmLabel: "好",
                onConfirm: function onConfirm() {
                  setModal(false);
                  proceedExpansion();
                }
              });
              return;
            }
            return proceedExpansion();
          }
          if (actionId === "ex_expansion_btn3") {
            state.run.recognition = clamp01to100(state.run.recognition + 3);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_expansion_btn2") {
            state.run.recognition = clamp01to100(state.run.recognition - 5);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_paincar_unapproved":
          if (actionId === "ex_pain_btn1") {
            state.run.recognition = clamp01to100(state.run.recognition + 5);
            state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_pain_btn2") {
            state.run.recognition = clamp01to100(state.run.recognition + 1);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_pain_btn3") {
            state.run.recognition = clamp01to100(state.run.recognition - 5);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_paincar_approved":
          if (actionId === "ex_pain_approved_btn1") {
            state.run.recognition = clamp01to100(state.run.recognition + 10);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_wrong_eyes":
          if (actionId === "ex_wrong_btn1") {
            return enterDiceRoll(state, {
              title: "奇怪的眼神",
              onWin: {
                action: "continue"
              },
              onLose: {
                action: "ending",
                ending: "onlineBully"
              },
              onDraw: {
                action: "penalty",
                recognition: -20,
                energy: -20
              }
            });
          }
          if (actionId === "ex_wrong_btn2") {
            state.run.recognition = clamp01to100(state.run.recognition - 40);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_wrong_btn3") {
            state.run.recognition = clamp01to100(state.run.recognition - 20);
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) - 20);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_no_makeup":
          if (actionId === "ex_no_makeup_btn1") {
            state.run.recognition = clamp01to100(state.run.recognition - 50);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_no_makeup_btn2") {
            return enterDiceRoll(state, {
              title: "没化妆......",
              onWin: {
                action: "continue"
              },
              onLose: {
                action: "ending",
                ending: "wigTorn"
              },
              onDraw: {
                action: "penalty",
                recognition: -20,
                energy: -20
              }
            });
          }
          if (actionId === "ex_no_makeup_btn3") {
            state.run.recognition = clamp01to100(state.run.recognition - 20);
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) - 20);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_has_pin":
          if (actionId === "ex_has_pin_btn1") {
            state.run.recognition = clamp01to100(state.run.recognition + 50);
            state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_has_pin_btn2") {
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "ex_zoom_zoom":
          if (actionId === "ex_zoom_btn1") {
            state.run.recognition = clamp01to100(state.run.recognition + 50);
            state.run.backpackBadges = clamp(state.run.backpackBadges - 1, 0, 100000);
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          if (actionId === "ex_zoom_btn2") {
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "dice_roll":
          if (actionId === "dice_roll_go") {
            var playerRoll = rollDice();
            var opponentRoll = rollDice();
            return enterDiceResult(state, playerRoll, opponentRoll);
          }
          break;
        case "dice_result":
          if (actionId === "dice_result_next") {
            var next = ctx.payload;
            if (next && next.action === "ending") {
              return setEnding(state, next.ending);
            }
            if (next && next.action === "penalty") {
              state.run.recognition = clamp01to100((state.run.recognition != null ? state.run.recognition : 0) + (next.recognition || 0));
              state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) + (next.energy || 0));
            }
            state.run.timeMinutes += 30;
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            if (checkAndEndLoveYourselfIfNeeded(state)) return;
            if (state.run.timeMinutes >= 18 * 60) return enterPhaseAfterOnly(state);
            return enterExhibitionEvent(state);
          }
          break;
        case "event_after_only_dinner":
          if (actionId === "after_dinner_yes") {
            if (!requireMoneyOrModal(state, 50)) return;
            state.run.money -= 50;
            state.run.energy = clamp01to100((state.run.energy != null ? state.run.energy : 0) + 30);
            state.run.recognition = clamp01to100((state.run.recognition != null ? state.run.recognition : 0) + 10);
            updateHudText(state);
            if (checkAndEndNoOneLikesMeIfNeeded(state)) return;
            return enterPhaseGoHome(state);
          }
          if (actionId === "after_dinner_no") return enterPhaseGoHome(state);
          break;
        case "event_go_home":
          if (actionId === "home_arrive_end") {
            return resolveEndByRecognition(state);
          }
          break;
      }
    }
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    bindUI({
      onAction: dispatch
    });
    var state = createDefaultState();
    window.__maoState = state;
    render(state);
  }
  window.__maoDispatch = dispatch;
  try {
    init();
  } catch (e) {
    console.error("Fatal error:", e);
    var app = document.getElementById("app");
    if (app) {
      app.innerHTML = "<div class='card' style='text-align:center;'>" + "<div class='title' style='font-size:20px;margin-top:0;'>游戏加载失败</div>" + "<div class='textBlock' style='opacity:0.95;'>" + String(e && (e.stack || e.message) ? e.stack || e.message : e) + "</div>" + "</div>";
    }
  }

})();
