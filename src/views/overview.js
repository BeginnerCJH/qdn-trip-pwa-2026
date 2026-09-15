import { hardDeadlineData } from "../selectors.js?v=41";

export function renderOverview(ctx) {
  const { trip, state, overviewDay, currentPhase, nextAction, tripHeroStatus, ticketCounts, escapeHtml, statusBadge } = ctx;
  const day = overviewDay();
  const phase = currentPhase();
  const action = nextAction();
  const heroStatus = tripHeroStatus();
  const tickets = ticketCounts();
  const ticketDone = tickets.purchased + tickets.waitlisted;
  const ticketDetail = tickets.pending ? `${tickets.pending} 段待处理` : tickets.waitlisted ? `${tickets.waitlisted} 段候补中` : "三段已处理";
  const taskDone = state.tasks.filter((task) => task.done).length;
  const guide = trip.guide?.days?.[day.id];
  const dayIndex = trip.days.indexOf(day);
  const firstItem = day.items[0];
  const actionDayAttribute = Number.isInteger(action.dayIndex) ? ` data-day-index="${action.dayIndex}"` : "";
  const dayContext = phase.tone === "before" ? "出发日先看这一段" : phase.tone === "trip" ? "今天先看这一段" : "最后一天回顾";

  return `
    <section class="overview-hero">
      <div class="overview-hero-top"><span>2026 国庆 · 黔东南</span><span>3 人 · 2 位司机</span></div>
      <h2>${escapeHtml(trip.subtitle)}</h2>
      <p>广州 → 三江 → 加榜 → 黎平 → 从江</p>
      <div class="overview-hero-bottom" aria-label="${escapeHtml(`${heroStatus.label} ${heroStatus.value}`)}"><span>${escapeHtml(heroStatus.label)}</span><strong>${escapeHtml(String(heroStatus.value))}</strong></div>
    </section>

    <section class="now-card">
      <div class="now-card-main"><span class="eyebrow">现在</span><h3>${escapeHtml(phase.label)}</h3><p>${escapeHtml(phase.description)}</p></div>
      <div class="now-card-next"><span class="eyebrow">下一步</span><strong>${escapeHtml(action.label)}</strong><small>${escapeHtml(action.detail)}</small><button class="primary-button" data-action="${action.action}"${actionDayAttribute}>去处理</button></div>
    </section>

    <section class="overview-day-card">
      <div class="overview-section-head"><div><span class="eyebrow">${escapeHtml(day.date)} · ${escapeHtml(day.city)}</span><h3>${dayContext}</h3></div>${statusBadge(`DAY ${dayIndex + 1}`, "soft")}</div>
      <h2>${escapeHtml(day.title)}</h2>
      <p class="overview-day-focus">${escapeHtml(day.routeInfo.focus)} · ${escapeHtml(day.routeInfo.buffer)}</p>
      ${guide ? `<div class="overview-judgement"><span>今日关键判断</span><strong>${escapeHtml(guide.lead)}</strong></div>` : ""}
      <div class="overview-first-stop"><span>第一件事</span><div><strong>${escapeHtml(firstItem.title)}</strong><small>${escapeHtml(firstItem.time)} · ${escapeHtml(firstItem.detail)}</small></div></div>
      <div class="overview-day-actions"><span>共 ${day.items.length} 个节点</span><button class="primary-button" data-action="route" data-day-index="${dayIndex}">打开当天行程</button></div>
    </section>

    ${renderJourneySpine(ctx, dayIndex)}

    <section class="home-progress-card">
      <div class="home-progress-head"><div><span class="eyebrow">准备概览</span><h3>已经确认的事</h3></div><button class="small-button ghost" data-view="prep">打开准备 ↗</button></div>
      <div class="home-progress-grid">
        ${progressItem("住宿", "4/4", "四晚已确认")}
        ${progressItem("车辆", "已下单", "10/3 10:30 取车")}
        ${progressItem("高铁", `${ticketDone}/3`, ticketDetail)}
      </div>
      <p class="home-progress-note">${state.tasks.length - taskDone ? `还有 ${state.tasks.length - taskDone} 项准备事项，具体清单集中在“准备”。` : "准备事项已完成，可以进入当天行程。"}</p>
    </section>

    ${renderDeadlines(ctx)}
  `;
}

function renderJourneySpine(ctx, currentIndex) {
  const { trip, escapeHtml, statusBadge } = ctx;
  const labels = ["三江", "从江", "黎平", "从江", "广州"];
  const subtitles = ["程阳八寨", "加榜梯田", "翘街", "黄岗 · 岜沙", "返程"];
  const nodes = trip.days.map((day, index) => `
    <button class="journey-node ${index === currentIndex ? "current" : ""}" data-action="route" data-day-index="${index}" aria-label="打开 ${day.date} ${labels[index]} 行程">
      <span>${escapeHtml(day.date)}</span>
      <strong>${escapeHtml(labels[index])}</strong>
      <small>${escapeHtml(subtitles[index])}</small>
    </button>
    ${index < trip.days.length - 1 ? `<span class="journey-connector ${index < currentIndex ? "passed" : ""}" aria-hidden="true"></span>` : ""}
  `).join("");
  return `
    <section class="journey-spine-card">
      <div class="overview-section-head"><div><span class="eyebrow">行程主线</span><h3>这趟旅行怎么走</h3></div><span class="label">5 天 · 1 条线</span></div>
      <div class="journey-spine">${nodes}</div>
      <div class="journey-spine-foot"><span>点某一天进入当天顺序 · 手机端左右滑动看完整路线</span>${statusBadge(`当前 DAY ${currentIndex + 1}`, "soft")}</div>
    </section>
  `;
}

function progressItem(title, value, detail) {
  return `<div class="home-progress-item"><span>${title}</span><strong>${value}</strong><small>${detail}</small></div>`;
}

function renderDeadlines(ctx) {
  const { state, currentPhase, statusBadge } = ctx;
  const phase = currentPhase();
  if (phase.tone === "after") {
    return `<section class="section-block deadline-section"><div class="section-heading"><div><p class="eyebrow">行程状态</p><h2>旅行已结束</h2></div><span class="badge badge-success">可复盘</span></div><div class="after-trip-card"><strong>把照片、花费和真实车次补完整</strong><p>硬节点已经过去，接下来可以整理费用、照片和这次路线经验。</p><button class="outline-button" data-view="expenses">整理费用</button></div></section>`;
  }

  const now = new Date();
  const nodes = hardDeadlineData.map((node) => ({ ...node, dateTime: new Date(node.at), done: Boolean(state.completedStops[node.stopId]) }));
  const active = nodes.filter((node) => !node.done).sort((a, b) => a.dateTime - b.dateTime);
  const visible = (active.length ? active : nodes).slice(0, 2);
  const hasOverdue = visible.some((node) => now >= node.dateTime && !node.done);
  const title = hasOverdue ? "需要确认的节点" : active.length ? "不能错过" : "硬节点已完成";
  const rows = visible.map((node) => {
    const overdue = now >= node.dateTime && !node.done;
    const detail = node.done ? "已在行程中标记完成" : overdue ? "时间已到，请确认是否已经完成" : node.detail;
    return `<div class="deadline-item ${node.done ? "is-done" : ""} ${overdue ? "is-overdue" : ""}"><span class="deadline-time">${node.date}<br><b>${node.time}</b></span><div><strong>${node.title}</strong><p>${detail}</p></div>${statusBadge(node.done ? "已完成" : overdue ? "已到时间" : "待处理", node.done ? "success" : overdue ? "coral" : "warning")}</div>`;
  }).join("");
  return `<section class="section-block deadline-section"><div class="section-heading"><div><p class="eyebrow">时间提醒</p><h2>${title}</h2></div><span class="label">自动更新</span></div><div class="deadline-list">${rows}</div></section>`;
}
