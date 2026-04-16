const app = document.getElementById("app");

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") node.className = v;
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

export function bindUI({ onAction }) {
  dispatchAction = onAction;
}

export function setModal(open, { title, body, confirmLabel, cancelLabel, onConfirm } = {}) {
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

  const btnRow = [btnConfirm];
  if (cancelLabel) {
    btnRow.unshift(
      el("button", {
        text: cancelLabel,
        onclick: () => setModal(false),
      }),
    );
  }

  const modal = el("div", { className: "modal" }, [
    el("div", { className: "modalHeader" }, [
      el("h3", { text: title || "" }),
    ]),
    el("div", { className: "modalContent" }, [
      el("div", { className: "modalBody", text: body || "" }),
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

  const clearLink = el("a", {
    href: "#",
    text: "清除游戏数据",
    onclick: (e) => {
      e.preventDefault();
      setModal(true, {
        title: "请注意",
        body: "您正在尝试清除游戏数据，我们推荐您每次更新版本时，都进行一次清除。",
        confirmLabel: "清除数据",
        cancelLabel: "取消",
        onConfirm: () => {
          localStorage.removeItem("maoOnly_textAdventure_save_v1");
          location.reload();
        },
      });
    },
  });

  const versionLink = el("a", {
    href: "#",
    text: "版本号：UmaFesSimulator 26.4.16 开发版",
    onclick: (e) => {
      e.preventDefault();
      setModal(true, {
        title: "更新日志",
        body: "UmaFesSimulator 26.4.16 开发版 更新内容\n——修复 现在有痛车情况下，cos服一栏固定刷出对应角色\n——添加 妆娘跑路彩蛋\n——修复 不做无料就不能加同人老师好友的问题\n——添加 游客/coser状态指示\n——添加 版本号的概念\n——优化 部分事件的文案表现\n添加 清除游戏数据功能",
        confirmLabel: "我知道了",
      });
    },
  });

  container.appendChild(
    el("div", { className: "pageFooter" }, [
      el("div", {}, [copyrightLink]),
      el("div", {}, [aiLink]),
      el("div", { style: "display:flex; gap:16px; justify-content:center;" }, [versionLink, clearLink]),
    ]),
  );
}

export function render(state) {
  if (!app) return;
  app.innerHTML = "";

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
        text: "今天这个时候你们应该已经在马O了吧，那种我从来没有去过的高级地方，看着那些我没见过的美丽谷子，领些那些我没领过的漂亮无料，跟各位老师近距离接触，我等你们回来，给我讲马O是有多好玩，看的开心，早点回来......去参加马O，是什么感觉......",
      }),
    );
    body.appendChild(
      el("div", { className: "controls" }, [
        el("button", {
          className: "primary",
          text: "开始游戏",
          onclick: () => dispatchAction && dispatchAction("start_role_select"),
        }),
      ]),
    );
    appendFooter(body);
    app.appendChild(card);
    return;
  }

  /* ── Role Select ────────────────────────────────────── */
  if (state.screen === "roleSelect") {
    const { card, body } = makeCard("角色抽选");

    const pre = el("div", { className: "textBlock" });
    pre.appendChild(
      el("p", {
        text: "以下是你的角色信息，点按再次抽取来重新随机一次，相信我，你会等到好运气的。\n准备好的话，就开始吧~",
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
      list.appendChild(el("p", { text: `角色类型：${templateLabel}` }));
      list.appendChild(el("p", { text: `金钱：${role.money}` }));
      list.appendChild(el("p", { text: `性别：${role.gender === 0 ? "男性" : "女性"}` }));
      list.appendChild(el("p", { text: `智能手机：${role.phoneLabel || role.phone || "-"}` }));
      list.appendChild(el("p", { text: `cosplay服装（衣柜）：${role.wardrobeCosplays.join("，") || "-"}` }));
      list.appendChild(el("p", { text: `痛车：${role.painCarLabel || "-"}` }));
      list.appendChild(el("p", { text: `痛车样式：${role.painCarStyle || "-"}` }));
      list.appendChild(el("p", { text: `家长/公司强度：${role.specialLabel || "-"}` }));
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
    }
    body.appendChild(controls);
    appendFooter(body);
    app.appendChild(card);
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
    if (bars.length > 0) body.appendChild(el("div", { className: "hudGrid" }, bars));

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
      const disabled = needBadges > 0 && badgesNow < needBadges;
      controls.appendChild(
        el("button", {
          className: c.primary ? "primary" : "",
          text: c.label,
          disabled: disabled ? "" : null,
          title: disabled ? `需要周边数量：${needBadges}` : null,
          onclick: () => {
            if (disabled) return;
            const selectEl = document.getElementById("uiSelect");
            const selectedValue = selectEl ? selectEl.value : null;
            dispatchAction && dispatchAction(c.choiceId, { payload: c.payload, selectedValue });
          },
        }),
      );
    }
    body.appendChild(controls);
    appendFooter(body);
    app.appendChild(card);
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
    appendFooter(body);
    app.appendChild(card);
    return;
  }

  /* ── Fallback ───────────────────────────────────────── */
  const { card, body } = makeCard("错误");
  body.appendChild(el("div", { className: "textBlock", text: "未知界面" }));
  app.appendChild(card);
}
