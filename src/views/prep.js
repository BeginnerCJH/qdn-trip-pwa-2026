export function renderPrep(ctx) {
  const { trip, state, escapeHtml, money, ticketCounts } = ctx;
  const tickets = ticketCounts();
  const pendingTasks = state.tasks.filter((task) => !task.done);
  const visibleTasks = (pendingTasks.length ? pendingTasks : state.tasks).slice(0, 4);
  const taskDone = state.tasks.length - pendingTasks.length;
  const statusText = tickets.pending ? `${tickets.pending} 段高铁待处理` : tickets.waitlisted ? `${tickets.waitlisted} 段高铁候补中` : "三段高铁已处理";
  const ticketFocus = tickets.pending
    ? { value: `${tickets.pending}/3`, label: "待处理" }
    : tickets.waitlisted
      ? { value: `${tickets.waitlisted}/3`, label: "候补中" }
      : { value: `${tickets.purchased}/3`, label: "已处理" };
  return `
    <section class="page-title"><p class="eyebrow">准备</p><h2>把出发前的事做完</h2><p>酒店和车辆已经确认，现在只需要按优先级处理车票、资料和行李。</p></section>

    <section class="prep-focus-card">
      <div><span class="eyebrow">现在最重要</span><h2>${statusText}</h2><p>10 月 3 日要在 09:30 左右到达从江，10:30 到店取车；三人连座是加分项。</p></div>
      <div class="prep-focus-action"><strong>${ticketFocus.value}</strong><span>${ticketFocus.label}</span><button class="primary-button" data-action="ticket-app">打开 12306</button></div>
    </section>

    <section class="prep-next-card">
      <div class="overview-section-head"><div><span class="eyebrow">下一步</span><h3>先完成这几件事</h3></div><span class="label">${taskDone}/${state.tasks.length}</span></div>
      <div class="prep-priority-list">${visibleTasks.map(renderTask).join("")}</div>
      ${pendingTasks.length > 4 ? `<p class="prep-more-hint">还有 ${pendingTasks.length - 4} 件，全部清单在下方。</p>` : ""}
    </section>

    <section class="section-block prep-ticket-section"><div class="section-heading"><div><p class="eyebrow">票务</p><h2>三段高铁</h2></div><span class="label">开票日已记录</span></div><div class="ticket-list">${trip.ticketSales.map((ticket) => renderTicket(ctx, ticket)).join("")}</div></section>

    <details class="prep-details"><summary>查看全部准备清单 <span>${taskDone}/${state.tasks.length} 已完成</span></summary><div class="task-groups">${[...new Set(state.tasks.map((task) => task.group))].map((group) => `<div class="task-group"><span class="group-title">${escapeHtml(group)}</span>${state.tasks.filter((task) => task.group === group).map(renderTask).join("")}</div>`).join("")}</div></details>

    <details class="prep-details"><summary>查看已确认订单 <span>4 晚酒店 · 1 台车</span></summary><div class="confirmed-details">${renderBookingVault(ctx)}${renderStays(ctx)}${renderVehicle(ctx)}</div></details>

    <section class="ai-note"><div class="ai-spark">✦</div><div><strong>AI 是可选的</strong><p>不接 AI 也能完成购票、导航、打卡和记账；需要比较车次或调整计划时再用。</p></div></section>
  `;
}

function renderBookingVault(ctx) {
  const { trip, escapeHtml } = ctx;
  const documents = [...trip.stays.map((stay) => ({ date: stay.date, title: stay.name, detail: stay.note, status: stay.document })), { date: "10/3—10/5", title: trip.vehicle.model, detail: trip.vehicle.store + " · 两位司机 · 取还车凭证", status: "租车订单已确认" }];
  const rows = documents.map((item) => `<article class="document-row"><div class="document-date">${escapeHtml(item.date)}</div><div class="document-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div><span class="document-status confirmed">${escapeHtml(item.status)}</span></article>`).join("");
  return `<section class="confirmed-block booking-vault"><div class="section-heading"><div><p class="eyebrow">订单资料</p><h3>出发时一处找齐</h3></div><span class="label">${documents.length} 份</span></div><p class="vault-hint">出发前把订单截图保存到手机，需要时再补录订单号。</p><div class="document-list">${rows}</div></section>`;
}

function renderStays(ctx) {
  const { trip, escapeHtml, money } = ctx;
  return `<section class="confirmed-block stay-section"><div class="section-heading"><div><p class="eyebrow">住宿</p><h3>四晚都已确认</h3></div><span class="label">3 人可住</span></div><div class="stay-list">${trip.stays.map((stay) => `<article class="stay-row"><div class="stay-date"><strong>${escapeHtml(stay.date)}</strong><span>${escapeHtml(stay.city)}</span></div><div class="stay-copy"><strong>${escapeHtml(stay.name)}</strong><span>${escapeHtml(stay.room)} · ${stay.nights} 晚</span></div><b>${money(stay.price)}</b><button class="map-button" data-map-query="${encodeURIComponent(stay.query)}" data-map-label="${escapeHtml(stay.name)}">地图 ↗</button></article>`).join("")}</div></section>`;
}

function renderVehicle(ctx) {
  const { trip } = ctx;
  return `<section class="confirmed-block vehicle-card"><div class="vehicle-visual">Jeep</div><div><span class="label">车辆 · ${trip.vehicle.status}</span><h3>${trip.vehicle.model}</h3><p>${trip.vehicle.specs}</p><p>${trip.vehicle.store} · 10/3 10:30—10/5 20:00</p></div><button class="text-button" data-action="vehicle">详情</button></section><div class="shortcut-row"><button class="outline-button" data-action="vehicle-map">导航到取车点 ↗</button><button class="outline-button" data-action="copy-vehicle">复制租车信息</button><span>两位司机轮换</span></div>`;
}

function renderTicket(ctx, ticket) {
  const { state, escapeHtml, formatDate, statusBadge, ticketTone } = ctx;
  const current = state.ticketStatus[ticket.id];
  const detail = state.ticketDetails[ticket.id] || {};
  const actual = detail.code ? `<div class="actual-ticket"><b>${escapeHtml(detail.code)}</b><span>${escapeHtml(detail.depart || "--:--")} → ${escapeHtml(detail.arrive || "--:--")}</span><small>已录入实际车次</small></div>` : "";
  return `<article class="ticket-card ${current === "已购票" ? "ticket-done" : ""}"><div class="ticket-top"><div><span class="label">${formatDate(ticket.date)} · 开票 ${formatDate(ticket.saleDate)}</span><h3>${escapeHtml(ticket.from)} <em>→</em> ${escapeHtml(ticket.to)}</h3></div>${statusBadge(current, ticketTone(current))}</div><div class="ticket-meta"><span>目标：${escapeHtml(ticket.window)}</span><span>优先级：${escapeHtml(ticket.priority)}</span></div><p class="ticket-note">${escapeHtml(ticket.note)}</p>${actual}<div class="ticket-detail-form"><input data-ticket-code="${ticket.id}" value="${escapeHtml(detail.code || "")}" placeholder="车次号，例如 DXXXX" aria-label="录入车次号" /><input data-ticket-depart="${ticket.id}" type="time" value="${escapeHtml(detail.depart || "")}" aria-label="出发时间" /><input data-ticket-arrive="${ticket.id}" type="time" value="${escapeHtml(detail.arrive || "")}" aria-label="到达时间" /><button class="small-button" data-ticket-save="${ticket.id}">保存</button></div><div class="ticket-actions"><button class="small-button" data-ticket="${ticket.id}">${current === "已购票" ? "改为待抢票" : "标记已购票"}</button><button class="small-button ghost" data-ticket-wait="${ticket.id}">${current === "候补中" ? "取消候补" : "设置候补"}</button><button class="small-button ghost" data-action="copy-ticket" data-ticket-copy="${ticket.id}">复制条件</button></div></article>`;
}

function renderTask(task) {
  return `<label class="task-row ${task.done ? "done" : ""}"><input type="checkbox" data-task="${task.id}" ${task.done ? "checked" : ""}/><span>${task.label}</span></label>`;
}
