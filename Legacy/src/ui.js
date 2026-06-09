/* Legacy UI – no themes, no achievements, no localStorage menu, simplified FAB */
import { GAME_VERSION } from "./storyData.js";

var app = document.getElementById("app");

function el(tag, attrs, children) {
  attrs = attrs || {};
  children = children || [];
  var node = document.createElement(tag);
  var keys = Object.keys(attrs);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = attrs[k];
    if (k === "className") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.indexOf("on") === 0 && typeof v === "function") node.addEventListener(k.slice(2), v);
    else {
      if (v === null || v === undefined) continue;
      node.setAttribute(k, v);
    }
  }
  for (var j = 0; j < children.length; j++) {
    var c = children[j];
    if (typeof c === "string") node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  }
  return node;
}

function makeCard(titleText) {
  var card = el("div", { className: "card" });
  var header = el("div", { className: "cardHeader" }, [
    el("div", { className: "title", text: titleText }),
  ]);
  var body = el("div", { className: "cardBody" });
  card.appendChild(header);
  card.appendChild(body);
  return { card: card, body: body };
}

var dispatchAction = null;

export function bindUI(opts) {
  dispatchAction = opts.onAction;
}

export function setModal(open, opts) {
  if (!open) return;
  opts = opts || {};
  var body = opts.body || "";
  if (!body && opts.htmlBody) {
    body = opts.htmlBody.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
  }
  if (!body) return;

  if (opts.cancelLabel || opts.onConfirm) {
    if (window.confirm(body)) {
      if (opts.onConfirm) opts.onConfirm();
      else if (dispatchAction) dispatchAction("modal_confirm");
    }
  } else {
    window.alert(body);
    if (dispatchAction) dispatchAction("modal_confirm");
  }
}

function renderBar(label, value, innerClass) {
  var pct = Math.max(0, Math.min(100, value));
  return el("div", { className: "barWrap" }, [
    el("div", { className: "barLabel" }, [
      el("div", { text: label }),
      el("div", { text: String(value) }),
    ]),
    el("div", { className: "barOuter" }, [
      el("div", { className: innerClass || "barInner", style: "width:" + pct + "%;" }),
    ]),
  ]);
}

function appendFooter(container) {
  container.appendChild(
    el("div", { className: "pageFooter" }, [
      el("div", {}, [
        el("a", {
          href: "https://adequip.mysxl.cn/",
          target: "_blank",
          rel: "noopener noreferrer",
          text: "2025-2026 爱丽数位装备社 文案版权所有",
        }),
      ]),
      el("div", {}, [
        el("a", {
          href: "#",
          text: "版本号：UmaFesSimulator C1.0.0 复古平台专版",
          onclick: function (e) {
            e.preventDefault();
            setModal(true, {
              title: "来自作者的一封信",
              body: "此为低版本浏览器兼容版，部分功能已简化。",
              confirmLabel: "我知道了",
            });
          },
        }),
      ]),
    ])
  );
}

export function render(state) {
  if (!app) return;
  app.innerHTML = "";

  if (!state || !state.screen) {
    var c0 = makeCard("加载中");
    c0.body.appendChild(el("div", { className: "textBlock", text: "加载中..." }));
    app.appendChild(c0);
    return;
  }

  /* ── Main Menu ──────────────────────────────── */
  if (state.screen === "mainMenu") {
    var cm = makeCard("去马娘Only是什么感觉");
    cm.body.appendChild(
      el("p", {
        className: "lead",
        text: "今天这个时候你们应该已经在马O了吧，那种我从来没有去过的高级地方，看着那些我没见过的美丽谷子，领些那些我没领过的漂亮无料，跟各位老师近距离接触，我等你们回来，给我讲马O是有多好玩，看的开心，早点回来......去参加马O，是什么感觉......\n提示：点按最后的版本号，可查看来自作者的话。",
      })
    );
    cm.body.appendChild(
      el("div", { className: "controls" }, [
        el("button", {
          className: "primary",
          text: "开始游戏",
          onclick: function () { if (dispatchAction) dispatchAction("start_role_select"); },
        }),
      ])
    );
    app.appendChild(cm.card);
    appendFooter(app);
    return;
  }

  /* ── Role Select ───────────────────────────── */
  if (state.screen === "roleSelect") {
    var cr = makeCard("角色抽选");
    var pre = el("div", { className: "textBlock" });
    pre.appendChild(
      el("p", {
        text: "以下是你的角色信息，点按再次抽取来重新随机一次，相信我，你会等到好运气的。\n准备好的话，就开始吧~",
      })
    );

    if (state.role && state.role.frozen) {
      var list = el("div", { className: "textBlock" });
      var role = state.role;
      var templateLabel =
        role.templateId === "high_school" ? "高中生"
        : role.templateId === "college" ? "大学生"
        : role.templateId === "office" ? "社畜"
        : String(role.templateId || "-");

      var genderRow = el("div", { style: "margin:10px 0;" }, [
        el("span", { text: "性别：" }),
        (function () {
          var s = document.createElement("select");
          s.id = "genderSelect";
          var optBlank = document.createElement("option");
          optBlank.value = ""; optBlank.textContent = "请选择性别";
          var optM = document.createElement("option");
          optM.value = "0"; optM.textContent = "男性";
          var optF = document.createElement("option");
          optF.value = "1"; optF.textContent = "女性";
          s.appendChild(optBlank);
          s.appendChild(optM);
          s.appendChild(optF);
          var sel = state.genderSelect;
          s.value = (sel === 0 || sel === 1) ? String(sel) : "";
          s.addEventListener("change", function () {
            if (dispatchAction) dispatchAction("select_gender", { payload: s.value });
          });
          return s;
        })(),
      ]);
      list.appendChild(genderRow);

      var noGender = state.genderSelect == null;
      list.appendChild(el("p", { text: "角色类型：" + (noGender ? "-" : templateLabel) }));
      list.appendChild(el("p", { text: "金钱：" + (noGender ? "-" : role.money) }));
      list.appendChild(el("p", { text: "智能手机：" + (noGender ? "-" : (role.phoneLabel || role.phone || "-")) }));
      list.appendChild(el("p", { text: "cosplay服装（衣柜）：" + (noGender ? "-" : (role.wardrobeCosplays.join("，") || "-")) }));
      list.appendChild(el("p", { text: "痛车：" + (noGender ? "-" : (role.painCarLabel || "-")) }));
      list.appendChild(el("p", { text: "痛车样式：" + (noGender ? "-" : (role.painCarStyle || "-")) }));
      list.appendChild(el("p", { text: "家长/公司强度：" + (noGender ? "-" : (role.specialLabel || "-")) }));
      pre.appendChild(list);
    } else {
      pre.appendChild(el("p", { text: "点击开始后会自动完成抽选。" }));
    }
    cr.body.appendChild(pre);

    var ctrls = el("div", { className: "controls" });
    if (!state.role || !state.role.frozen) {
      ctrls.appendChild(
        el("button", {
          className: "primary",
          text: "开始抽选",
          onclick: function () { if (dispatchAction) dispatchAction("roll_role"); },
        })
      );
    } else {
      ctrls.appendChild(
        el("button", {
          text: "再次抽取",
          onclick: function () { if (dispatchAction) dispatchAction("roll_role_again"); },
        })
      );
      ctrls.appendChild(
        el("button", {
          className: "primary",
          text: "进入游戏",
          onclick: function () { if (dispatchAction) dispatchAction("enter_game"); },
        })
      );
    }
    cr.body.appendChild(ctrls);
    app.appendChild(cr.card);
    appendFooter(app);
    return;
  }

  /* ── Game ──────────────────────────────────── */
  if (state.screen === "game") {
    var cg = makeCard(state.nodeTitle || "");

    if (state.run) {
      var money = state.run.money != null ? state.run.money : 0;
      var badges = state.run.backpackBadges != null ? state.run.backpackBadges : 0;
      var isCoser = (state.run.backpackCosplays || []).length > 0;
      var pills = [
        el("div", { className: "resourcePill", text: "金钱：" + money }),
        el("div", { className: "resourcePill", text: "周边：" + badges }),
      ];
      if (state.recognition != null) {
        pills.push(el("div", {
          className: "resourcePill resourcePill--status",
          text: "形态：" + (isCoser ? "Coser" : "游客"),
        }));
      }
      cg.body.appendChild(el("div", { className: "resourceLine" }, pills));
    }

    var bars = [];
    if (state.energy != null) bars.push(renderBar("精力", state.energy, "barInner"));
    if (state.recognition != null) bars.push(renderBar("认可", state.recognition, "barInner--recognition"));
    if (bars.length > 0) {
      cg.body.appendChild(el("div", { className: "hudGrid" }, bars));
      if (state.energy != null && state.recognition != null) {
        cg.body.appendChild(el("p", {
          text: "注意：认可度每半小时会自动减少2点",
          style: "color:#999; font-size:12px; margin:4px 0 0;",
        }));
      }
    }

    cg.body.appendChild(
      el("div", { className: "textBlock", style: "margin-top:14px;" }, [
        el("p", { text: state.nodeText || "" }),
      ])
    );

    if (state.select) {
      cg.body.appendChild(
        el("div", { className: "row", style: "margin-top:14px;" }, [
          el("div", { style: "width:100%;" }, [
            el("div", { text: state.select.label, style: "font-weight:900; margin-bottom:8px;" }),
            (function () {
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
            })(),
          ]),
        ])
      );
    }

    var gameControls = el("div", { className: "controls" });
    var choices = state.choices || [];
    for (var ci = 0; ci < choices.length; ci++) {
      (function (c) {
        var badgesNow = state.run ? (state.run.backpackBadges != null ? state.run.backpackBadges : 0) : 0;
        var needBadges = c.requiresBadges != null ? c.requiresBadges : 0;
        var badgeDisabled = needBadges > 0 && badgesNow < needBadges;
        var disabled = badgeDisabled || !!c.disabled;
        var title = badgeDisabled ? "需要周边数量：" + needBadges : (c.disabledHint || null);
        gameControls.appendChild(
          el("button", {
            className: c.primary ? "primary" : "",
            text: c.label,
            disabled: disabled ? "" : null,
            title: title,
            onclick: function () {
              if (disabled) {
                if (dispatchAction) dispatchAction(c.choiceId, { payload: c.payload, selectedValue: null, disabledClick: true });
                return;
              }
              var selectEl = document.getElementById("uiSelect");
              var selectedValue = selectEl ? selectEl.value : null;
              if (dispatchAction) dispatchAction(c.choiceId, { payload: c.payload, selectedValue: selectedValue });
            },
          })
        );
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
    app.appendChild(cg.card);
    appendFooter(app);
    return;
  }

  /* ── Ending ────────────────────────────────── */
  if (state.screen === "ending") {
    var ce = makeCard(state.endingName || "结局");
    ce.body.appendChild(el("div", { className: "textBlock", text: state.endingText || "" }));
    ce.body.appendChild(
      el("div", { className: "controls" }, [
        el("button", {
          className: "primary",
          text: "重新开始",
          onclick: function () { if (dispatchAction) dispatchAction("restart"); },
        }),
      ])
    );
    app.appendChild(ce.card);
    appendFooter(app);
    return;
  }

  /* ── Fallback ──────────────────────────────── */
  var cf = makeCard("错误");
  cf.body.appendChild(el("div", { className: "textBlock", text: "未知界面" }));
  app.appendChild(cf.card);
}

/* ── Simplified FAB: sound toggle only ─────────── */
(function setupFab() {
  var soundEnabled = true;

  window.__getSoundEnabled = function () { return soundEnabled; };

  var wrapper = document.createElement("div");
  wrapper.className = "fab";

  var soundBtn = document.createElement("button");
  soundBtn.className = "fab__sound";
  var updateBtn = function () {
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
