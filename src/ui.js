import { getSoundEnabled, setSoundEnabled } from "./storage.js";
import { applyTheme, getThemeId, setThemeId, getThemeList, getThemeDesc } from "./theme.js";
import { ACHIEVEMENTS, getUnlockedIds, unlockAchievement } from "./achievements.js";
import { formatTimeHHMM } from "./utils.js";

const app = document.getElementById("app");

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else {
      if (v === null || v === undefined) continue;
      node.setAttribute(k, v);
    }
  }
  for (const c of children) {
    if (typeof c === "string") node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  }
  return node;
}

/** Build the outer .card with a green header bar and a white body. */
function makeCard(titleText) {
  const card   = el("div", { className: "card" });
  const header = el("div", { className: "cardHeader" }, [
    el("div", { className: "title", text: titleText }),
  ]);
  const body   = el("div", { className: "cardBody" });
  card.appendChild(header);
  card.appendChild(body);
  return { card, body };
}

let dispatchAction = null;
let __uiScreen = null; // overlay screen (e.g. "achievements"), takes priority over game screens
let __konamiRevealed = false;
let __konamiIndex = 0;

const KONAMI_SEQ = [
  "arrowup","arrowup","arrowdown","arrowdown",
  "arrowleft","arrowright","arrowleft","arrowright",
  "b","a",
];
const KONAMI_ALT = [
  "w","w","s","s",
  "a","d","a","d",
  "j","k",
];

// Register Konami listener once at module load
document.addEventListener("keydown", (e) => {
  if (__uiScreen !== "achievements") return;
  const key = e.key.toLowerCase();
  if (key === KONAMI_SEQ[__konamiIndex] || key === KONAMI_ALT[__konamiIndex]) {
    __konamiIndex++;
    if (__konamiIndex >= KONAMI_SEQ.length) {
      __konamiIndex = 0;
      __konamiRevealed = true;
      unlockAchievement("konami_code");
      render(window.__latestState);
    }
  } else {
    __konamiIndex = 0;
  }
});

export function bindUI({ onAction }) {
  dispatchAction = onAction;
}

export function setModal(open, { title, body, htmlBody, confirmLabel, cancelLabel, onConfirm, actions, confirmDisabledMs } = {}) {
  let overlay = document.getElementById("modalOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modalOverlay";
    overlay.className = "modalOverlay";
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = "";
  overlay.classList.toggle("open", open);
  if (!open) return;

  // Support custom actions array, or fall back to confirm/cancel
  let btnRow;
  if (actions && actions.length > 0) {
    btnRow = actions.map((a) =>
      el("button", {
        className: a.className || "",
        text: a.label,
        onclick: () => {
          setModal(false);
          if (a.onClick) a.onClick();
        },
      }),
    );
  } else {
    const btnConfirm = el("button", {
      className: "primary",
      text: confirmLabel || "确认",
      onclick: () => {
        if (onConfirm) {
          onConfirm();
        } else {
          dispatchAction && dispatchAction("modal_confirm");
        }
      },
    });
    if (confirmDisabledMs > 0) {
      btnConfirm.disabled = true;
      setTimeout(() => { btnConfirm.disabled = false; }, confirmDisabledMs);
    }
    btnRow = [btnConfirm];
    if (cancelLabel) {
      btnRow.unshift(
        el("button", {
          text: cancelLabel,
          onclick: () => setModal(false),
        }),
      );
    }
  }

  const modalBody = el("div", { className: "modalBody" });
  if (htmlBody) {
    modalBody.innerHTML = htmlBody;
  } else if (body instanceof Node) {
    modalBody.appendChild(body);
  } else {
    modalBody.textContent = body || "";
  }

  const modal = el("div", { className: "modal" }, [
    el("div", { className: "modalHeader" }, [
      el("h3", { text: title || "" }),
    ]),
    el("div", { className: "modalContent" }, [
      modalBody,
      el("div", { className: "controls", style: "justify-content:flex-end; margin-top:14px;" }, btnRow),
    ]),
  ]);
  overlay.appendChild(modal);
}

function renderBar(label, value, innerClass) {
  const pct  = Math.max(0, Math.min(100, value));
  return el("div", { className: "barWrap" }, [
    el("div", { className: "barLabel" }, [
      el("div", { text: label }),
      el("div", { text: String(value) }),
    ]),
    el("div", { className: "barOuter" }, [
      el("div", { className: innerClass || "barInner", style: `width:${pct}%;` }),
    ]),
  ]);
}

function appendFooter(container) {
  const copyrightLink = el("a", {
    href: "https://adequip.mysxl.cn/",
    target: "_blank",
    rel: "noopener noreferrer",
    text: "2025-2026 爱丽数位装备社 文案版权所有",
  });

const GitHubLink = el("a", {
    href: "https://github.com/SumikoSato/sumikosato.github.io",
    target: "_blank",
    rel: "noopener noreferrer",
    text: "前往GitHub仓库>>",
  });
  
  const aiLink = el("a", {
    href: "#",
    text: "本网页使用生成式人工智能技术辅助开发，了解详情>>",
    onclick: (e) => {
      e.preventDefault();
      setModal(true, {
        title: "温馨提示",
        body: "本网页文案均为原创，在网页制作过程中，通过生成式人工智能技术生成可用的网页代码。",
        confirmLabel: "我知道了",
      });
    },
  });

  const versionLink = el("a", {
    href: "#",
    text: "版本号：UmaFesSimulator 26.6.15 橙子果酱生日纪念版",
    onclick: (e) => {
      e.preventDefault();
      setModal(true, {
        title: "更新日志",
        body: "UmaFesSimulator 26.6.15 橙子果酱生日纪念版 更新内容\n——默认主题焕新升级，增加了由@WangMT 制作的游戏图标。\n——游戏架构升级，使用独立的故事引擎和独立的配置文件，为后续DLC功能做好准备。\n——基于全新架构大量丰富文案，充实游戏内容。(时间有限只优化了部分文案，非常私密马赛（鞠躬）（咔咔咔）)\n——解决开车时仍然会进入地铁特殊事件的问题。\n——增加了时间显示功能，方便您确认展会的剩余时间。\n——增加睡大街功能，现在你可以在马娘Only前一天睡大街了。感谢@阿道夫希尔薇 的贡献。\n——加入新游戏内容预告，敬请期待！",
        confirmLabel: "我知道了",
      });
    },
  });

  const historyLink = el("a", {
    href: "#",
    text: "更新历史",
    onclick: async (e) => {
      e.preventDefault();
      try {
        const resp = await fetch("./update_history.md");
        const md = await resp.text();
        setModal(true, {
          title: "更新历史",
          htmlBody: md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"),
          confirmLabel: "好",
        });
      } catch {
        setModal(true, { title: "更新历史", body: "加载失败", confirmLabel: "好" });
      }
    },
  });

  container.appendChild(
    el("div", { className: "pageFooter" }, [
      el("div", {}, [copyrightLink]),
      el("div", {}, [GitHubLink]),
      el("div", {}, [aiLink]),
      el("div", {}, [versionLink]),
      el("div", {}, [historyLink]),
    ]),
  );
}

export function render(state) {
  if (!app) return;
  app.innerHTML = "";
  window.__latestState = state;

  /* ── Achievements overlay ─────────────────────────── */
  if (__uiScreen === "achievements") {
    const { card, body } = makeCard("成就");
    const unlocked = getUnlockedIds();
    const revealed = __konamiRevealed;
    ACHIEVEMENTS.forEach((ach, i) => {
      const got = unlocked.has(ach.id);
      const show = got || revealed;
      const row = el("div", { style: "display:flex;align-items:flex-start;justify-content:space-between;padding:12px 0;" }, [
        el("div", { style: "flex:1;min-width:0;" }, [
          el("p", { style: `margin:0;font-weight:600;${show ? "" : "color:var(--text-sub);"}`, text: show ? ach.title : "？？？" }),
          el("p", { style: `margin:4px 0 0;${show ? "" : "color:var(--text-sub);"}`, text: show ? ach.desc : "？？？" }),
          el("p", { style: "margin:4px 0 0;font-size:0.85em;color:var(--text-sub);", text: ach.howToGet }),
        ]),
        el("span", {
          style: `margin-left:12px;white-space:nowrap;font-size:0.85em;color:${got ? "var(--green-dark)" : "var(--text-sub)"};`,
          text: got ? "已解锁" : "未解锁",
        }),
      ]);
      if (i > 0) {
        body.appendChild(el("hr", { style: "border:none;border-top:1px solid var(--border);margin:0;" }));
      }
      body.appendChild(row);
    });
    body.appendChild(
      el("div", { className: "controls", style: "margin-top:16px;" }, [
        el("button", {
          className: "primary",
          text: "返回",
          onclick: () => {
            __uiScreen = null;
            __konamiRevealed = false;
            __konamiIndex = 0;
            render(window.__latestState);
          },
        }),
      ]),
    );
    app.appendChild(card);
    appendFooter(app);
    return;
  }

  if (!state || !state.screen) {
    const { card, body } = makeCard("加载中");
    body.appendChild(el("div", { className: "textBlock", text: "加载中..." }));
    app.appendChild(card);
    return;
  }

  /* ── Main Menu ──────────────────────────────────────── */
  if (state.screen === "mainMenu") {
    const { card, body } = makeCard("去马娘Only是什么感觉");
    body.appendChild(
      el("p", {
        className: "lead",
        text: "今天这个时候你们应该已经在马O了吧，那种我从来没有去过的高级地方，看着那些我没见过的美丽谷子，领些那些我没领过的漂亮无料，跟各位老师近距离接触，我等你们回来，给我讲马O是有多好玩，看的开心，早点回来......去参加马O，是什么感觉......\n在本游戏中，您将通过不同的身份及选项，体验一个小县城coser前往马娘Only的酸甜苦辣。\n我们希望在这个简单的网页文字冒险游戏中，无论任何人，都能在游戏里找到你的影子。\n游戏内容部分基于本人及其他玩家的真实故事改编，一些细节为游戏进程做出了适应性调整。",
      }),
    );
    body.appendChild(
      el("a", {
        className: "lead",
        style: "display:block; color:#5EA820;",
        href: "https://umamap.pro",
        target: "_blank",
        text: "想去真的马娘Only？不妨来马O地图看看>>",
      }),
    );
    body.appendChild(
      el("div", { className: "controls" }, [
         el("button", {
          text: "DLC：社团",
          onclick: () => dispatchAction && dispatchAction("start_doujin"),
        }),
        el("button", {
          className: "primary",
          text: "开始游戏",
          onclick: () => dispatchAction && dispatchAction("start_role_select"),
        }),
        el("button", {
          text: "查看成就",
          onclick: () => { __uiScreen = "achievements"; render(state); },
        }),
      ]),
    );
    app.appendChild(card);
    appendFooter(app);
    return;
  }

  /* ── Role Select ────────────────────────────────────── */
  if (state.screen === "roleSelect") {
    const { card, body } = makeCard("角色抽选");

    const pre = el("div", { className: "textBlock" });
    pre.appendChild(
      el("p", {
        text: "欢迎来到马娘Only模拟器！\n请先选择一个性别，然后继续。\n以下是你的角色信息，点按再次抽取来重新随机一次，相信我，你会等到好运气的。\n准备好的话，就开始吧~",
      }),
    );

    if (state.role && state.role.frozen) {
      const list = el("div", { className: "textBlock" });
      const role = state.role;
      const templateLabel =
        role.templateId === "high_school" ? "高中生"
        : role.templateId === "college"   ? "大学生"
        : role.templateId === "office"    ? "社畜"
        : String(role.templateId || "-");

      // 性别下拉菜单（第一位）
      const genderRow = el("div", { style: "margin:10px 0;" }, [
        el("span", { text: "性别：" }),
        (() => {
          const s = document.createElement("select");
          s.id = "genderSelect";
          const optBlank = document.createElement("option");
          optBlank.value = ""; optBlank.textContent = "请选择性别";
          const optM = document.createElement("option");
          optM.value = "0"; optM.textContent = "男性";
          const optF = document.createElement("option");
          optF.value = "1"; optF.textContent = "女性";
          s.appendChild(optBlank);
          s.appendChild(optM);
          s.appendChild(optF);
          const sel = state.genderSelect;
          s.value = (sel === 0 || sel === 1) ? String(sel) : "";
          s.addEventListener("change", () => {
            dispatchAction && dispatchAction("select_gender", { payload: s.value });
          });
          return s;
        })(),
      ]);
      list.appendChild(genderRow);

      const noGender = state.genderSelect == null;
      list.appendChild(el("p", { text: `角色类型：${noGender ? "-" : templateLabel}` }));
      list.appendChild(el("p", { text: `金钱：${noGender ? "-" : role.money}` }));
      list.appendChild(el("p", { text: `智能手机：${noGender ? "-" : (role.phoneLabel || role.phone || "-")}` }));
      list.appendChild(el("p", { text: `拥有的cosplay服装：${noGender ? "-" : (role.wardrobeCosplays.join("，") || "-")}` }));
      list.appendChild(el("p", { text: `痛车：${noGender ? "-" : (role.painCarLabel || "-")}` }));
      list.appendChild(el("p", { text: `痛车样式：${noGender ? "-" : (role.painCarStyle || "-")}` }));
      list.appendChild(el("p", { text: `家长/公司强度：${noGender ? "-" : (role.specialLabel || "-")}` }));
      pre.appendChild(list);
    } else {
      pre.appendChild(el("p", { text: "点击开始后会自动完成抽选。" }));
    }
    body.appendChild(pre);

    const controls = el("div", { className: "controls" });
    if (!state.role || !state.role.frozen) {
      controls.appendChild(
        el("button", {
          className: "primary",
          text: "开始抽选",
          onclick: () => dispatchAction && dispatchAction("roll_role"),
        }),
      );
    } else {
      controls.appendChild(
        el("button", {
          text: "再次抽取",
          onclick: () => dispatchAction && dispatchAction("roll_role_again"),
        }),
      );
      controls.appendChild(
        el("button", {
          className: "primary",
          text: "进入游戏",
          onclick: () => dispatchAction && dispatchAction("enter_game"),
        }),
      );
      if ((state.rerollCount ?? 0) >= 10 && !state.derDismissed) {
        controls.appendChild(
          el("button", {
            text: "想买车做痛车？",
            onclick: () => {
              window.__playSfx && window.__playSfx("./sound/der.mp3");
              unlockAchievement("buy_a_der");
              setModal(true, {
                title: "你买个Der！",
                body: "你这个情况，你买个车，贴个车膜然后全国漫展来回跑，获得所谓的认可，你认可个Der？你该没钱还是没钱，该难受还是难受，追求什么二次元？你现在二十多岁最美好的年纪，最应该做的事情就是积累财富，而不是买个破车在你的小圈子里炫耀，你买个Der！",
                confirmLabel: "听超哥的，不买！",
                confirmDisabledMs: 3000,
                onConfirm: () => {
                  setModal(false);
                  window.__stopSfx && window.__stopSfx();
                  dispatchAction && dispatchAction("dismiss_der");
                },
              });
            },
          }),
        );
      }
    }
    body.appendChild(controls);
    app.appendChild(card);
    appendFooter(app);
    return;
  }

  /* ── Game ───────────────────────────────────────────── */
  if (state.screen === "game") {
    const { card, body } = makeCard(state.nodeTitle || "");

    if (state.run) {
      const money  = state.run.money  ?? 0;
      const badges = state.run.backpackBadges ?? 0;
      const isCoser = (state.run.backpackCosplays || []).length > 0;
      const pills = [
        el("div", { className: "resourcePill", text: `金钱：${money}` }),
        el("div", { className: "resourcePill", text: `周边：${badges}` }),
      ];
      // 仅在时间已激活时显示当前时间
      if (state.run.timeMinutes != null) {
        pills.push(el("div", {
          className: "resourcePill",
          text: `时间：${formatTimeHHMM(state.run.timeMinutes)}`,
        }));
      }
      // 仅在展会阶段（recognition 已激活）显示形态
      if (state.recognition != null) {
        pills.push(el("div", {
          className: "resourcePill resourcePill--status",
          text: `形态：${isCoser ? "Coser" : "游客"}`,
        }));
      }
      body.appendChild(el("div", { className: "resourceLine" }, pills));
    }

    const bars = [];
    if (state.energy      != null) bars.push(renderBar("精力", state.energy,      "barInner"));
    if (state.recognition != null) bars.push(renderBar("认可", state.recognition, "barInner--recognition"));
    if (bars.length > 0) {
      body.appendChild(el("div", { className: "hudGrid" }, bars));
      if (state.energy != null && state.recognition != null) {
        body.appendChild(el("p", { text: "注意：认可度每半小时会自动减少2点", style: "color:#999; font-size:12px; margin:4px 0 0;" }));
      }
    }

    body.appendChild(
      el("div", { className: "textBlock", style: "margin-top:14px;" }, [
        el("p", { text: state.nodeText || "" }),
      ]),
    );

    if (state.select) {
      body.appendChild(
        el("div", { className: "row", style: "margin-top:14px;" }, [
          el("div", { style: "width:100%;" }, [
            el("div", { text: state.select.label, style: "font-weight:900; margin-bottom:8px;" }),
            (() => {
              const s = document.createElement("select");
              s.id = "uiSelect";
              for (const opt of state.select.options) {
                const o = document.createElement("option");
                o.value = opt.value;
                o.textContent = opt.label;
                s.appendChild(o);
              }
              return s;
            })(),
          ]),
        ]),
      );
    }

    const controls = el("div", { className: "controls" });
    for (const c of state.choices || []) {
      const badgesNow = state.run?.backpackBadges ?? 0;
      const needBadges = c.requiresBadges ?? 0;
      const badgeDisabled = needBadges > 0 && badgesNow < needBadges;
      const disabled = badgeDisabled || !!c.disabled;
      const title = badgeDisabled ? `需要周边数量：${needBadges}` : (c.disabledHint || null);
      controls.appendChild(
        el("button", {
          className: c.primary ? "primary" : "",
          text: c.label,
          disabled: disabled ? "" : null,
          title: title,
          onclick: () => {
            if (disabled) {
              dispatchAction && dispatchAction(c.choiceId, { payload: c.payload, selectedValue: null, disabledClick: true });
              return;
            }
            const selectEl = document.getElementById("uiSelect");
            const selectedValue = selectEl ? selectEl.value : null;
            dispatchAction && dispatchAction(c.choiceId, { payload: c.payload, selectedValue });
          },
        }),
      );
    }
    body.appendChild(controls);
    if (state.autoDisableMs > 0) {
      const btns = controls.querySelectorAll("button");
      btns.forEach((b) => { b.disabled = true; });
      setTimeout(() => {
        btns.forEach((b) => { b.disabled = false; });
      }, state.autoDisableMs);
    }
    app.appendChild(card);
    appendFooter(app);
    return;
  }

  /* ── Ending ─────────────────────────────────────────── */
  if (state.screen === "ending") {
    const { card, body } = makeCard(state.endingName || "结局");
    body.appendChild(el("div", { className: "textBlock", text: state.endingText || "" }));
    body.appendChild(
      el("div", { className: "controls" }, [
        el("button", {
          className: "primary",
          text: "重新开始",
          onclick: () => dispatchAction && dispatchAction("restart"),
        }),
      ]),
    );
    app.appendChild(card);
    appendFooter(app);
    return;
  }

  /* ── Fallback ───────────────────────────────────────── */
  const { card, body } = makeCard("错误");
  body.appendChild(el("div", { className: "textBlock", text: "未知界面" }));
  app.appendChild(card);
}

/* ── Floating assistant menu ──────────────────────────── */
(function setupFab() {
  const wrapper = document.createElement("div");
  wrapper.className = "fab";

  const menu = document.createElement("div");
  menu.className = "fab__menu";

  // 输出日志
  const logBtn = document.createElement("button");
  logBtn.className = "fab__item";
  logBtn.textContent = "输出日志";
  logBtn.addEventListener("click", () => {
    wrapper.classList.remove("fab--open");
    setModal(true, {
      title: "注意",
      body: "你正在尝试输出日志，请仅在游戏遇到故障时使用，如需要反馈，请将生成的文件发送给开发者邮箱orangal@outlook.com，并留下你的联系方式，我们会在第一时间处理您的问题。",
      confirmLabel: "生成日志",
      cancelLabel: "取消",
      onConfirm: () => {
        setModal(false);
        const log = window.__maoState?.actionsLog || [];
        const lines = log.map(
          (e, i) => `[${i + 1}] ${e.time}  screen=${e.screen}  node=${e.nodeId}  action=${e.action}`,
        );
        const content = lines.length ? lines.join("\n") : "（暂无操作记录）";
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `game_log_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  });

  // 清除数据
  const clearBtn = document.createElement("button");
  clearBtn.className = "fab__item";
  clearBtn.textContent = "清除数据";
  clearBtn.addEventListener("click", () => {
    wrapper.classList.remove("fab--open");
    setModal(true, {
      title: "注意",
      body: "您正在尝试清除游戏数据，这可能会导致令您后悔的不可逆的存档丢失。",
      confirmLabel: "清除数据",
      cancelLabel: "取消",
      onConfirm: () => {
        localStorage.removeItem("maoOnly_textAdventure_save_v1");
        localStorage.removeItem("maoOnly_textAdventure_dismissRestore");
        location.href = location.pathname + "?nocache=" + Date.now();
      },
    });
  });

  menu.appendChild(logBtn);
  menu.appendChild(clearBtn);

  // 隐藏UI
  const hideBtn = document.createElement("button");
  hideBtn.className = "fab__item";
  hideBtn.textContent = "隐藏UI";
  hideBtn.addEventListener("click", () => {
    wrapper.classList.remove("fab--open");
    const appRoot = document.querySelector(".appRoot");
    if (!appRoot) return;
    const hidden = appRoot.style.display === "none";
    appRoot.style.display = hidden ? "" : "none";
    hideBtn.textContent = hidden ? "隐藏UI" : "显示UI";
  });
  menu.appendChild(hideBtn);

  // 主题切换
  const themeBtn = document.createElement("button");
  themeBtn.className = "fab__item";
  themeBtn.textContent = "切换主题";
  themeBtn.addEventListener("click", () => {
    wrapper.classList.remove("fab--open");
    const themes = getThemeList();
    const currentId = getThemeId();

    const selectEl = document.createElement("select");
    selectEl.className = "fab__themeSelect";
    for (const t of themes) {
      const o = document.createElement("option");
      o.value = t.id;
      o.textContent = t.label;
      selectEl.appendChild(o);
    }
    selectEl.value = currentId;

    const descEl = document.createElement("p");
    descEl.className = "themeDesc";
    descEl.textContent = getThemeDesc(currentId);

    selectEl.addEventListener("change", () => {
      descEl.textContent = getThemeDesc(selectEl.value);
    });

    const bodyEl = document.createElement("div");
    bodyEl.className = "themeModalBody";
    bodyEl.appendChild(selectEl);
    bodyEl.appendChild(descEl);

    setModal(true, {
      title: "切换主题",
      body: bodyEl,
      confirmLabel: "好",
      cancelLabel: "取消",
      onConfirm: () => {
        const id = selectEl.value;
        setThemeId(id);
        applyTheme(id);
      },
    });
  });
  menu.appendChild(themeBtn);

  // 切换复古版
  const legacyBtn = document.createElement("button");
  legacyBtn.className = "fab__item";
  legacyBtn.textContent = "切换复古版";
  legacyBtn.addEventListener("click", () => {
    wrapper.classList.remove("fab--open");
    const base = location.pathname + location.search.replace(/[?&]legacy(?:[=&#]|$)/gi, "").replace(/[?&]native(?:[=&#]|$)/gi, "").replace(/&$/, "");
    location.href = base + (base.indexOf("?") >= 0 ? "&" : "?") + "legacy";
  });
  menu.appendChild(legacyBtn);

  // Sound toggle button
  const soundBtn = document.createElement("button");
  soundBtn.className = "fab__sound";
  const updateSoundBtn = () => {
    const on = getSoundEnabled();
    soundBtn.textContent = on ? "🔊" : "🔇";
    soundBtn.title = on ? "声音：开" : "声音：关";
  };
  updateSoundBtn();
  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const next = !getSoundEnabled();
    setSoundEnabled(next);
    if (!next && window.__stopBgm) window.__stopBgm();
    updateSoundBtn();
  });

  const toggle = document.createElement("button");
  toggle.className = "fab__toggle";
  toggle.textContent = "辅助功能";
  toggle.addEventListener("click", () => {
    wrapper.classList.toggle("fab--open");
  });

  // 点击页面其他区域关闭菜单
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove("fab--open");
    }
  });

  wrapper.appendChild(menu);
  const bottomRow = document.createElement("div");
  bottomRow.className = "fab__bottom";
  bottomRow.appendChild(soundBtn);
  bottomRow.appendChild(toggle);
  wrapper.appendChild(bottomRow);
  document.body.appendChild(wrapper);
})();
