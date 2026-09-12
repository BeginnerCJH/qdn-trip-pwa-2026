import { trip } from "./trip-data.js";

const STORAGE_KEY = "qdn-trip-state-v1";
const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

if (new URLSearchParams(window.location.search).has("reset")) localStorage.removeItem(STORAGE_KEY);
function parseState(value) {
  try {
    const parsed = JSON.parse(value || "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

const sharedState = parseState(new URLSearchParams(window.location.hash.slice(1)).get("state"));
const stored = parseState(localStorage.getItem(STORAGE_KEY));
const seed = sharedState || stored || {};
const defaultTicketStatus = Object.fromEntries(trip.ticketSales.map((ticket) => [ticket.id, ticket.status]));
const state = {
  view: "overview",
  tasks: Array.isArray(seed.tasks) ? seed.tasks : trip.initialTasks,
  expenses: Array.isArray(seed.expenses) ? seed.expenses : trip.initialExpenses,
  ticketStatus: { ...defaultTicketStatus, ...(seed.ticketStatus || {}) }
};

if (sharedState) localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: state.tasks, expenses: state.expenses, ticketStatus: state.ticketStatus }));

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: state.tasks, expenses: state.expenses, ticketStatus: state.ticketStatus }));
}

function money(value) {
  return `¥${Number(value).toLocaleString("zh-CN")}`;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00+08:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function daysUntil(dateString) {
  const today = new Date();
  const target = new Date(`${dateString}T00:00:00+08:00`);
  return Math.max(0, Math.ceil((target - today) / 86400000));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function statusBadge(text, tone = "neutral") {
  return `<span class="badge badge-${tone}">${text}</span>`;
}

function ticketTone(status) {
  if (status === "已购票") return "success";
  if (status === "候补中") return "warning";
  return "coral";
}

function render() {
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  const views = { overview: renderOverview, route: renderRoute, prep: renderPrep, expenses: renderExpenses };
  app.innerHTML = views[state.view]();
  bindEvents();
}

function renderOverview() {
  const departureDays = daysUntil(trip.start);
  const nextTicket = trip.ticketSales.find((ticket) => state.ticketStatus[ticket.id] !== "已购票");
  const ticketDone = trip.ticketSales.filter((ticket) => state.ticketStatus[ticket.id] === "已购票").length;
  const taskDone = state.tasks.filter((task) => task.done).length;
  return `
    <section class="hero-card">
      <div class="hero-copy">
        <span class="season-tag">贵州 · 3 人 · 自驾接力</span>
        <h2>${trip.subtitle}</h2>
        <p>从广州出发，穿过侗寨、梯田和苗寨，最后在从江鼓楼收尾。</p>
      </div>
      <div class="departure-count"><strong>${departureDays}</strong><span>天后出发</span></div>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">旅行控制台</p><h2>现在最重要的事</h2></div>${statusBadge("AI 可选", "soft")}</div>
      <div class="focus-card">
        <div class="focus-icon">↗</div>
        <div class="focus-content">
          <span class="label">下一场票务任务 · ${nextTicket ? formatDate(nextTicket.saleDate) : "已完成"}</span>
          <h3>${nextTicket ? `${formatDate(nextTicket.date)} ${nextTicket.from} → ${nextTicket.to}` : "三段高铁都已处理"}</h3>
          <p>${nextTicket ? nextTicket.note : "现在可以把精力放到出发前核验。"}</p>
        </div>
        ${nextTicket ? `<button class="text-button" data-action="prep">查看</button>` : ""}
      </div>
    </section>

    <section class="progress-grid">
      ${progressCard("住宿", "4/4", "已确认", "success")}
      ${progressCard("车辆", "已下单", "10/3 10:30 取车", "success")}
      ${progressCard("高铁", `${ticketDone}/3`, ticketDone === 3 ? "已全部处理" : `${3 - ticketDone} 段待处理`, ticketDone === 3 ? "success" : ticketDone ? "warning" : "coral")}
      ${progressCard("准备", `${taskDone}/${state.tasks.length}`, "事项完成", taskDone === state.tasks.length ? "success" : "warning")}
    </section>

    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">五天路线</p><h2>从梯田到鼓楼</h2></div><button class="text-button" data-action="route">查看全部</button></div>
      <div class="route-strip">
        ${trip.days.map((day, index) => `<button class="day-node ${index === 0 ? "current" : ""}" data-action="route" aria-label="查看${day.date}行程"><span>${day.date.replace("/", ".")}</span><strong>${day.city}</strong></button>`).join('<i class="route-line"></i>')}
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">硬节点</p><h2>两件事不能迟</h2></div></div>
      <div class="deadline-list">
        <div class="deadline-item"><span class="deadline-time">10/3<br><b>10:30</b></span><div><strong>从江高铁站取车</strong><p>建议高铁 09:30 左右到达</p></div><span class="risk-dot high"></span></div>
        <div class="deadline-item"><span class="deadline-time">10/5<br><b>20:00</b></span><div><strong>完成还车</strong><p>岜沙距还车点近，是安全收尾段</p></div><span class="risk-dot high"></span></div>
      </div>
    </section>

    <section class="ai-note"><div class="ai-spark">✦</div><div><strong>AI 领队是可选的</strong><p>没有 AI，这个 App 依然可以完整完成旅行。</p></div><button class="text-button" data-action="ai">了解</button></section>
  `;
}

function progressCard(title, value, caption, tone) {
  return `<div class="progress-card"><span class="label">${title}</span><strong>${value}</strong><span class="caption ${tone}">${caption}</span></div>`;
}

function renderRoute() {
  return `
    <section class="page-title"><p class="eyebrow">执行模式</p><h2>五天时间轴</h2><p>路线按“下一步行动”组织，地点、接驳和硬截止时间分开记录。</p></section>
    <div class="route-list">${trip.days.map(renderDay).join("")}</div>
    <section class="source-card"><div><span class="label">数据说明</span><h3>路线事实和动态信息分开</h3><p>地点关系以已确认资料为准；路况、天气、活动在出发前和每天早上再核验。</p></div><button class="text-button" data-action="sources">查看来源</button></section>
  `;
}

function renderDay(day) {
  return `
    <article class="day-card">
      <div class="day-header"><div class="day-number">${day.date.split("/")[1]}</div><div><span class="label">${day.weekday} · ${day.city}</span><h3>${day.title}</h3><p>${day.mood}</p></div>${statusBadge(`风险 ${day.risk}`, day.risk === "中" ? "soft" : "warning")}</div>
      <div class="day-items">${day.items.map(renderItem).join("")}</div>
    </article>
  `;
}

function renderItem(item) {
  const place = item.placeId ? trip.places[item.placeId] : null;
  const icon = { train: "🚄", transfer: "↗", spot: "⌁", culture: "♫", hotel: "⌂", car: "▣", drive: "→", deadline: "!", food: "◌" }[item.type] || "•";
  return `<div class="timeline-item"><div class="timeline-dot type-${item.type}">${icon}</div><div class="timeline-main"><span class="item-time">${item.time}</span><strong>${item.title}</strong><p>${item.detail}</p>${place ? `<div class="item-actions"><span class="mini-tag">${place.tag}</span><button class="map-button" data-map="${encodeURIComponent(place.query)}">打开地图 ↗</button></div>` : ""}</div></div>`;
}

function renderPrep() {
  const groups = [...new Set(state.tasks.map((task) => task.group))];
  return `
    <section class="page-title"><p class="eyebrow">筹备模式</p><h2>出发准备台</h2><p>酒店和车辆已经稳住，接下来把三段高铁和接驳关系处理好。</p></section>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">高铁票</p><h2>抢票作战台</h2></div><a class="outline-button" href="https://www.12306.cn/index/" target="_blank" rel="noreferrer">打开 12306 ↗</a></div>
      <div class="ticket-list">${trip.ticketSales.map(renderTicket).join("")}</div>
    </section>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">待办清单</p><h2>一起完成</h2></div><span class="label">${state.tasks.filter((task) => task.done).length}/${state.tasks.length}</span></div>
      <div class="task-groups">${groups.map((group) => `<div class="task-group"><span class="group-title">${group}</span>${state.tasks.filter((task) => task.group === group).map(renderTask).join("")}</div>`).join("")}</div>
    </section>
    <section class="section-block stay-section"><div class="section-heading"><div><p class="eyebrow">住宿</p><h2>四晚都已确认</h2></div><span class="label">3 人可住</span></div>
      <div class="stay-list">${trip.stays.map((stay) => `<article class="stay-row"><div class="stay-date"><strong>${stay.date}</strong><span>${stay.city}</span></div><div class="stay-copy"><strong>${stay.name}</strong><span>${stay.room} · ${stay.nights} 晚</span></div><b>${money(stay.price)}</b></article>`).join("")}</div>
    </section>
    <section class="vehicle-card"><div class="vehicle-visual">Jeep</div><div><span class="label">车辆 · ${trip.vehicle.status}</span><h3>${trip.vehicle.model}</h3><p>${trip.vehicle.specs}</p><p>${trip.vehicle.store} · 10/3 10:30—10/5 20:00</p></div><button class="text-button" data-action="vehicle">详情</button></section>
    <section class="ai-note"><div class="ai-spark">✦</div><div><strong>不接 AI 也能完成所有任务</strong><p>AI 只在你需要比较车次或调整计划时出现。</p></div></section>
  `;
}

function renderTicket(ticket) {
  const current = state.ticketStatus[ticket.id];
  return `<article class="ticket-card"><div class="ticket-top"><div><span class="label">${formatDate(ticket.date)} · 开票 ${formatDate(ticket.saleDate)}</span><h3>${ticket.from} <em>→</em> ${ticket.to}</h3></div>${statusBadge(current, ticketTone(current))}</div><div class="ticket-meta"><span>目标：${ticket.window}</span><span>优先级：${ticket.priority}</span></div><p class="ticket-note">${ticket.note}</p><div class="ticket-actions"><button class="small-button" data-ticket="${ticket.id}">${current === "已购票" ? "改为待抢票" : "标记已购票"}</button><button class="small-button ghost" data-ticket-wait="${ticket.id}">${current === "候补中" ? "取消候补" : "设置候补"}</button></div></article>`;
}

function renderTask(task) {
  return `<label class="task-row ${task.done ? "done" : ""}"><input type="checkbox" data-task="${task.id}" ${task.done ? "checked" : ""}/><span>${task.label}</span></label>`;
}

function renderExpenses() {
  const total = state.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const perPerson = total / trip.travelers;
  return `
    <section class="page-title"><p class="eyebrow">记录模式</p><h2>费用和分账</h2><p>先记总额，旅途中再补充油费、过路费、停车费和餐饮。</p></section>
    <section class="expense-summary"><div><span class="label">当前已记录</span><strong>${money(total)}</strong><p>约 ${money(perPerson)} / 人</p></div><div class="summary-ring"><span>${state.expenses.length}</span><small>笔</small></div></section>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">已记录</p><h2>支出明细</h2></div></div><div class="expense-list">${state.expenses.map((item) => `<div class="expense-row"><div class="expense-icon">${item.category === "住宿" ? "⌂" : item.category === "交通" ? "→" : "¥"}</div><div><strong>${item.title}</strong><span>${item.category} · ${item.paidBy}</span></div><b>${money(item.amount)}</b></div>`).join("")}</div></section>
    <section class="add-expense"><div><span class="label">快速记一笔</span><h3>旅途中不用打开表格</h3></div><form id="expenseForm"><input name="title" placeholder="例如：停车费" required /><input name="amount" type="number" min="0" step="0.01" placeholder="金额" required /><select name="category"><option>餐饮</option><option>交通</option><option>门票</option><option>住宿</option><option>其他</option></select><button class="primary-button" type="submit">添加</button></form></section>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => handleAction(button.dataset.action)));
  document.querySelectorAll("[data-map]").forEach((button) => button.addEventListener("click", () => window.open(`https://www.amap.com/search?query=${button.dataset.map}`, "_blank", "noopener,noreferrer")));
  document.querySelectorAll("[data-task]").forEach((input) => input.addEventListener("change", () => { const task = state.tasks.find((item) => item.id === input.dataset.task); if (task) task.done = input.checked; save(); render(); }));
  document.querySelectorAll("[data-ticket]").forEach((button) => button.addEventListener("click", () => { const id = button.dataset.ticket; state.ticketStatus[id] = state.ticketStatus[id] === "已购票" ? "待抢票" : "已购票"; save(); render(); showToast(state.ticketStatus[id] === "已购票" ? "已标记为已购票" : "已恢复为待抢票"); }));
  document.querySelectorAll("[data-ticket-wait]").forEach((button) => button.addEventListener("click", () => { const id = button.dataset.ticketWait; state.ticketStatus[id] = state.ticketStatus[id] === "候补中" ? "待抢票" : "候补中"; save(); render(); showToast(state.ticketStatus[id] === "候补中" ? "已标记为候补中" : "已取消候补"); }));
  document.querySelector("#expenseForm")?.addEventListener("submit", (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); state.expenses.push({ id: `expense-${Date.now()}`, title: form.get("title"), amount: Number(form.get("amount")), category: form.get("category"), paidBy: "未分配" }); save(); render(); showToast("已添加一笔费用"); });
}

function handleAction(action) {
  if (action === "prep") state.view = "prep";
  if (action === "route") state.view = "route";
  if (action === "vehicle") showToast(`${trip.vehicle.model} · ${trip.vehicle.specs}`);
  if (action === "ai") showToast("AI 是可选模块，核心功能不受影响");
  if (action === "sources") window.open(trip.sources[0].url, "_blank", "noopener,noreferrer");
  render();
}

document.querySelector("#shareButton").addEventListener("click", async () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("reset");
  url.hash = `state=${encodeURIComponent(JSON.stringify({ tasks: state.tasks, expenses: state.expenses, ticketStatus: state.ticketStatus }))}`;
  const shareUrl = url.toString();
  const shareText = `${trip.title}\n2026/10/2—10/6 · 3人 · 黔东南\n打开链接可同步当前票务、待办和费用状态`;
  if (navigator.share) {
    try { await navigator.share({ title: trip.title, text: shareText, url: shareUrl }); } catch { /* user cancelled */ }
  } else {
    await navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`);
    showToast("共享链接已复制");
  }
});

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));

try {
  render();
} catch (error) {
  console.error(error);
  app.innerHTML = `<section class="page-title"><p class="eyebrow">原型诊断</p><h2>页面需要刷新一次</h2><p>数据文件已加载，但本次渲染遇到了问题：${String(error?.message || error)}</p></section>`;
}


