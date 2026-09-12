import { trip } from "./trip-data.js";

const STORAGE_KEY = "qdn-trip-state-v3";
const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const installButton = document.querySelector("#installButton");
let deferredInstallPrompt = null;

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallButton() {
  if (!installButton) return;
  if (isStandalone()) {
    installButton.textContent = "已安装";
    installButton.disabled = true;
    installButton.classList.add("installed");
    return;
  }
  installButton.textContent = deferredInstallPrompt ? "安装应用" : "安装到手机";
  installButton.disabled = false;
  installButton.classList.remove("installed");
  installButton.title = deferredInstallPrompt ? "安装到手机" : "请使用 Chrome 菜单安装";
}

async function installApp() {
  if (isStandalone()) {
    showToast("已经在 App 模式运行");
    return;
  }
  if (!deferredInstallPrompt) {
    showToast("请用手机 Chrome 菜单选择“安装应用”；若一直转圈，先清除本站数据后重试");
    return;
  }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  updateInstallButton();
  showToast(choice?.outcome === "accepted" ? "已发起安装，请稍等片刻" : "已取消安装");
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButton();
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateInstallButton();
  showToast("旅行 App 已安装到手机");
});
window.addEventListener("pageshow", updateInstallButton);

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
  mode: seed.mode || "before",
  activeDay: Number.isInteger(seed.activeDay) ? seed.activeDay : 0,
  tasks: Array.isArray(seed.tasks) ? seed.tasks : trip.initialTasks,
  expenses: Array.isArray(seed.expenses) ? seed.expenses : trip.initialExpenses,
  ticketStatus: { ...defaultTicketStatus, ...(seed.ticketStatus || {}) },
  ticketDetails: seed.ticketDetails || {},
  completedStops: seed.completedStops || {}
};

if (sharedState) save();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    mode: state.mode,
    activeDay: state.activeDay,
    tasks: state.tasks,
    expenses: state.expenses,
    ticketStatus: state.ticketStatus,
    ticketDetails: state.ticketDetails,
    completedStops: state.completedStops
  }));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function activeDay() {
  return trip.days[state.activeDay] || trip.days[0];
}

function mapWeb(query) {
  return "https://www.amap.com/search?query=" + encodeURIComponent(query);
}

function mapApp(query) {
  return "amapuri://search?keyword=" + encodeURIComponent(query) + "&src=trip-pwa&callnative=1";
}

function openWeb(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function tryOpenApp(appUrl, webUrl, label) {
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  if (!mobile) {
    openWeb(webUrl);
    return;
  }
  let hidden = false;
  const onVisibility = () => { if (document.hidden) hidden = true; };
  document.addEventListener("visibilitychange", onVisibility, { once: true });
  showToast("正在尝试打开" + label + "，未安装会自动打开网页版");
  window.location.href = appUrl;
  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onVisibility);
    if (!hidden) openWeb(webUrl);
  }, 950);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard?.writeText(text);
    showToast(message);
  } catch {
    showToast("当前浏览器不允许复制，请手动查看");
  }
}

function ticketQuery(ticket) {
  return ticket.date + " " + ticket.from + " → " + ticket.to + "；" + ticket.window + "；" + trip.preferences.seat;
}

function shareUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("reset");
  url.hash = "state=" + encodeURIComponent(JSON.stringify({
    mode: state.mode,
    activeDay: state.activeDay,
    tasks: state.tasks,
    expenses: state.expenses,
    ticketStatus: state.ticketStatus,
    ticketDetails: state.ticketDetails,
    completedStops: state.completedStops
  }));
  return url.toString();
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
  const views = { overview: renderOverview, route: renderRoute, prep: renderPrep, expenses: renderExpenses, tools: renderTools };
  app.innerHTML = views[state.view]();
  bindEvents();
}

function renderOverview() {
  const day = activeDay();
  const dayIndex = trip.days.indexOf(day);
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

    <section class="mode-switch">
      <button class="${state.mode === "before" ? "selected" : ""}" data-mode="before">出发前筹备</button>
      <button class="${state.mode === "trip" ? "selected" : ""}" data-mode="trip">旅途中执行</button>
      <span>可手动切换</span>
    </section>

    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">行动中心</p><h2>现在就能做什么</h2></div><span class="label">外部 App 优先</span></div>
      <div class="action-grid">
        <button class="action-tile" data-action="ticket-app"><span class="action-icon train">🚄</span><strong>抢票</strong><small>尝试打开 12306</small></button>
        <button class="action-tile" data-action="next-map"><span class="action-icon map">⌁</span><strong>导航</strong><small>下一站直接打开</small></button>
        <button class="action-tile" data-action="hotel-map"><span class="action-icon hotel">⌂</span><strong>找酒店</strong><small>地图查入住点</small></button>
        <button class="action-tile" data-action="share"><span class="action-icon share">↗</span><strong>同步</strong><small>分享当前状态</small></button>
      </div>
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
${renderTodayCard(day, dayIndex)}

    <section class="progress-grid">
      ${progressCard("住宿", "4/4", "已确认", "success")}
      ${progressCard("车辆", "已下单", "10/3 10:30 取车", "success")}
      ${progressCard("高铁", `${ticketDone}/3`, ticketDone === 3 ? "已全部处理" : `${3 - ticketDone} 段待处理`, ticketDone === 3 ? "success" : ticketDone ? "warning" : "coral")}
      ${progressCard("准备", `${taskDone}/${state.tasks.length}`, "事项完成", taskDone === state.tasks.length ? "success" : "warning")}
    </section>

    <section class="section-block">
      <div class="section-heading"><div><p class="eyebrow">五天路线</p><h2>从梯田到鼓楼</h2></div><button class="text-button" data-action="route">查看全部</button></div>
      <div class="route-strip">
        ${trip.days.map((day, index) => `<button class="day-node ${index === state.activeDay ? "current" : ""}" data-action="route" data-day-index="${index}" aria-label="查看${day.date}行程"><span>${day.date.replace("/", ".")}</span><strong>${day.city}</strong></button>`).join('<i class="route-line"></i>')}
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
  return "<div class=\"progress-card\"><span class=\"label\">" + title + "</span><strong>" + value + "</strong><span class=\"caption " + tone + "\">" + caption + "</span></div>";
}

function renderTodayCard(day, dayIndex) {
  const items = day.items.slice(0, 3).map((item, index) => {
    const stopId = day.id + "-" + index;
    const done = Boolean(state.completedStops[stopId]);
    return "<div class=\"quick-item\"><span>" + escapeHtml(item.time) + "</span><strong>" + escapeHtml(item.title) + "</strong><button data-stop=\"" + stopId + "\" class=\"" + (done ? "checked" : "") + "\">" + (done ? "已完成" : "打卡") + "</button></div>";
  }).join("");
  return "<section class=\"today-card\"><div class=\"today-heading\"><div><p class=\"eyebrow\">" + (state.mode === "trip" ? "今日执行" : "路线预览") + "</p><h3>" + escapeHtml(day.title) + "</h3></div>" + statusBadge("DAY " + (dayIndex + 1) + " · " + day.date, "soft") + "</div><p>" + escapeHtml(day.routeInfo.focus) + " · " + escapeHtml(day.routeInfo.buffer) + "</p><div class=\"quick-list\">" + items + "</div></section>";
}
function renderDayPicker() {
  return trip.days.map((day, index) => "<button class=\"" + (index === state.activeDay ? "selected" : "") + "\" data-day-index=\"" + index + "\"><span>DAY " + (index + 1) + "</span><strong>" + escapeHtml(day.date) + "</strong><small>" + escapeHtml(day.city) + "</small></button>").join("");
}

function renderRouteSummary(day) {
  return "<section class=\"route-summary\"><div><span class=\"label\">" + escapeHtml(day.date) + " · " + escapeHtml(day.city) + "</span><h3>" + escapeHtml(day.routeInfo.focus) + "</h3></div><div class=\"route-stats\"><b>" + escapeHtml(day.routeInfo.distance) + "</b><span>" + escapeHtml(day.routeInfo.travel) + "</span><small>" + escapeHtml(day.routeInfo.buffer) + "</small></div></section>";
}

function renderRoute() {
  const day = activeDay();
  return `
    <section class="page-title"><p class="eyebrow">执行模式</p><h2>五天时间轴</h2><p>路线按“下一步行动”组织，地点、接驳和硬截止时间分开记录。</p></section>
    <div class="day-picker route-picker">${renderDayPicker()}</div>
    ${renderRouteSummary(day)}
    <div class="route-list">${trip.days.map(renderDay).join("")}</div>
    <section class="source-card"><div><span class="label">数据说明</span><h3>路线事实和动态信息分开</h3><p>地点关系以已确认资料为准；路况、天气、活动在出发前和每天早上再核验。</p></div><button class="text-button" data-action="sources">查看来源</button></section>
  `;
}

function renderDay(day) {
  return `
    <article class="day-card">
      <div class="day-header"><div class="day-number">${day.date.split("/")[1]}</div><div><span class="label">${day.weekday} · ${day.city}</span><h3>${day.title}</h3><p>${day.mood}</p></div>${statusBadge(`风险 ${day.risk}`, day.risk === "中" ? "soft" : "warning")}</div>
      <div class="day-items">${day.items.map((item, index) => renderItem(item, day.id, index)).join("")}</div>
    </article>
  `;
}

function renderItem(item) {
  const place = item.placeId ? trip.places[item.placeId] : null;
  const dayId = arguments[1] || "day";
  const index = Number.isInteger(arguments[2]) ? arguments[2] : 0;
  const stopId = dayId + "-" + index;
  const done = Boolean(state.completedStops[stopId]);
  const icon = { train: "🚄", transfer: "↗", spot: "⌁", culture: "♫", hotel: "⌂", car: "▣", drive: "→", deadline: "!", food: "◌" }[item.type] || "•";
  const locationAction = place ? "<span class=\"mini-tag\">" + escapeHtml(place.tag) + "</span><button class=\"map-button\" data-map-query=\"" + encodeURIComponent(place.query) + "\" data-map-label=\"" + escapeHtml(place.name) + "\">导航 ↗</button>" : "";
  const ticketAction = item.type === "train" ? "<button class=\"map-button\" data-action=\"ticket-app\">12306 ↗</button>" : "";
  return "<div class=\"timeline-item " + (done ? "is-done" : "") + "\"><div class=\"timeline-dot type-" + item.type + "\">" + icon + "</div><div class=\"timeline-main\"><span class=\"item-time\">" + escapeHtml(item.time) + "</span><strong>" + escapeHtml(item.title) + "</strong><p>" + escapeHtml(item.detail) + "</p><div class=\"item-actions\">" + locationAction + ticketAction + "<button class=\"stop-button " + (done ? "done" : "") + "\" data-stop=\"" + stopId + "\">" + (done ? "已完成" : "完成") + "</button></div></div></div>";
}

function renderPrep() {
  const groups = [...new Set(state.tasks.map((task) => task.group))];
  return `
    <section class="page-title"><p class="eyebrow">筹备模式</p><h2>出发准备台</h2><p>酒店和车辆已经稳住，接下来把三段高铁和接驳关系处理好。</p></section>
    <section class="ticket-command"><div><p class="eyebrow">抢票作战台</p><h2>先打开 12306，再回来录入结果</h2><p>优先满足日期和 10/3 取车衔接，再考虑三人连座。</p></div><div class="command-actions"><button class="primary-button" data-action="ticket-app">尝试打开 12306</button><button class="outline-button" data-action="copy-all-tickets">复制三段条件</button></div></section>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">高铁票</p><h2>抢票作战台</h2></div><a class="outline-button" href="https://www.12306.cn/index/" target="_blank" rel="noreferrer">打开 12306 ↗</a></div>
      <div class="ticket-list">${trip.ticketSales.map(renderTicket).join("")}</div>
    </section>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">待办清单</p><h2>一起完成</h2></div><span class="label">${state.tasks.filter((task) => task.done).length}/${state.tasks.length}</span></div>
      <div class="task-groups">${groups.map((group) => `<div class="task-group"><span class="group-title">${group}</span>${state.tasks.filter((task) => task.group === group).map(renderTask).join("")}</div>`).join("")}</div>
    </section>
    <section class="section-block stay-section"><div class="section-heading"><div><p class="eyebrow">住宿</p><h2>四晚都已确认</h2></div><span class="label">3 人可住</span></div>
      <div class="stay-list">${trip.stays.map((stay) => `<article class="stay-row"><div class="stay-date"><strong>${stay.date}</strong><span>${stay.city}</span></div><div class="stay-copy"><strong>${escapeHtml(stay.name)}</strong><span>${escapeHtml(stay.room)} · ${stay.nights} 晚</span></div><b>${money(stay.price)}</b><button class="map-button" data-map-query="${encodeURIComponent(stay.query)}" data-map-label="${escapeHtml(stay.name)}">地图 ↗</button></article>`).join("")}</div>
    </section>
    <section class="vehicle-card"><div class="vehicle-visual">Jeep</div><div><span class="label">车辆 · ${trip.vehicle.status}</span><h3>${trip.vehicle.model}</h3><p>${trip.vehicle.specs}</p><p>${trip.vehicle.store} · 10/3 10:30—10/5 20:00</p></div><button class="text-button" data-action="vehicle">详情</button></section>
    <section class="shortcut-row"><button class="outline-button" data-action="vehicle-map">导航到取车点 ↗</button><button class="outline-button" data-action="copy-vehicle">复制租车信息</button><span>订单已确认 · 两位司机轮换</span></section>
    <section class="ai-note"><div class="ai-spark">✦</div><div><strong>不接 AI 也能完成所有任务</strong><p>AI 只在你需要比较车次或调整计划时出现。</p></div></section>
  `;
}

function renderTicket(ticket) {
  const current = state.ticketStatus[ticket.id];
  const detail = state.ticketDetails[ticket.id] || {};
  const actual = detail.code ? "<div class=\"actual-ticket\"><b>" + escapeHtml(detail.code) + "</b><span>" + escapeHtml(detail.depart || "--:--") + " → " + escapeHtml(detail.arrive || "--:--") + "</span><small>已录入实际车次</small></div>" : "";
  return "<article class=\"ticket-card " + (current === "已购票" ? "ticket-done" : "") + "\"><div class=\"ticket-top\"><div><span class=\"label\">" + formatDate(ticket.date) + " · 开票 " + formatDate(ticket.saleDate) + "</span><h3>" + escapeHtml(ticket.from) + " <em>→</em> " + escapeHtml(ticket.to) + "</h3></div>" + statusBadge(current, ticketTone(current)) + "</div><div class=\"ticket-meta\"><span>目标：" + escapeHtml(ticket.window) + "</span><span>优先级：" + escapeHtml(ticket.priority) + "</span></div><p class=\"ticket-note\">" + escapeHtml(ticket.note) + "</p>" + actual + "<div class=\"ticket-detail-form\"><input data-ticket-code=\"" + ticket.id + "\" value=\"" + escapeHtml(detail.code || "") + "\" placeholder=\"车次号，例如 DXXXX\" aria-label=\"录入车次号\" /><input data-ticket-depart=\"" + ticket.id + "\" type=\"time\" value=\"" + escapeHtml(detail.depart || "") + "\" aria-label=\"出发时间\" /><input data-ticket-arrive=\"" + ticket.id + "\" type=\"time\" value=\"" + escapeHtml(detail.arrive || "") + "\" aria-label=\"到达时间\" /><button class=\"small-button\" data-ticket-save=\"" + ticket.id + "\">保存</button></div><div class=\"ticket-actions\"><button class=\"small-button\" data-ticket=\"" + ticket.id + "\">" + (current === "已购票" ? "改为待抢票" : "标记已购票") + "</button><button class=\"small-button ghost\" data-ticket-wait=\"" + ticket.id + "\">" + (current === "候补中" ? "取消候补" : "设置候补") + "</button><button class=\"small-button ghost\" data-action=\"copy-ticket\" data-ticket-copy=\"" + ticket.id + "\">复制条件</button></div></article>";
  return `<article class="ticket-card"><div class="ticket-top"><div><span class="label">${formatDate(ticket.date)} · 开票 ${formatDate(ticket.saleDate)}</span><h3>${ticket.from} <em>→</em> ${ticket.to}</h3></div>${statusBadge(current, ticketTone(current))}</div><div class="ticket-meta"><span>目标：${ticket.window}</span><span>优先级：${ticket.priority}</span></div><p class="ticket-note">${ticket.note}</p><div class="ticket-actions"><button class="small-button" data-ticket="${ticket.id}">${current === "已购票" ? "改为待抢票" : "标记已购票"}</button><button class="small-button ghost" data-ticket-wait="${ticket.id}">${current === "候补中" ? "取消候补" : "设置候补"}</button></div></article>`;
}

function renderTask(task) {
  return `<label class="task-row ${task.done ? "done" : ""}"><input type="checkbox" data-task="${task.id}" ${task.done ? "checked" : ""}/><span>${task.label}</span></label>`;
}

function renderExpenses() {
  const total = state.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const perPerson = total / trip.travelers;
  const balances = trip.members.map((member) => {
    const paid = state.expenses.filter((item) => item.paidBy === member.label).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return `<div class="balance-card"><span>${escapeHtml(member.label)}</span><strong>${money(paid)}</strong><small>已垫付</small></div>`;
  }).join("");
  return `
    <section class="page-title"><p class="eyebrow">记录模式</p><h2>费用和分账</h2><p>先记总额，旅途中再补充油费、过路费、停车费和餐饮。</p></section>
    <section class="expense-summary"><div><span class="label">当前已记录</span><strong>${money(total)}</strong><p>约 ${money(perPerson)} / 人</p></div><div class="summary-ring"><span>${state.expenses.length}</span><small>笔</small></div></section>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">已记录</p><h2>支出明细</h2></div></div><div class="expense-list">${state.expenses.map((item) => `<div class="expense-row"><div class="expense-icon">${item.category === "住宿" ? "⌂" : item.category === "交通" ? "→" : "¥"}</div><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.category)} · ${escapeHtml(item.paidBy || "未分配")}</span></div><b>${money(item.amount)}</b><button class="delete-button" data-expense-delete="${item.id}" aria-label="删除${escapeHtml(item.title)}">×</button></div>`).join("")}</div></section>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">谁先垫付</p><h2>旅伴分账快照</h2></div><span class="label">平均 ${money(perPerson)} / 人</span></div><div class="balance-grid">${balances}</div></section>
    <section class="add-expense"><div><span class="label">快速记一笔</span><h3>旅途中不用打开表格</h3></div><form id="expenseForm"><input name="title" placeholder="例如：停车费" required /><input name="amount" type="number" min="0" step="0.01" placeholder="金额" required /><select name="category"><option>餐饮</option><option>交通</option><option>门票</option><option>住宿</option><option>其他</option></select><select name="paidBy"><option value="未分配">谁垫付？</option>${trip.members.map((member) => `<option value="${escapeHtml(member.label)}">${escapeHtml(member.label)}</option>`).join("")}</select><button class="primary-button" type="submit">添加</button></form></section>
  `;
}

function renderTools() {
  const roles = trip.members.map((member, index) => "<div class=\"role-row\"><span class=\"role-number\">0" + (index + 1) + "</span><div><strong>" + escapeHtml(member.label) + "</strong><small>" + escapeHtml(member.role) + "</small></div><span class=\"role-task\">" + (index === 0 ? "取还车 / 山路" : index === 1 ? "导航 / 备份司机" : "票务 / 记账 / 拍照") + "</span></div>").join("");
  return "<section class=\"page-title\"><p class=\"eyebrow\">工具箱</p><h2>把旅行 App 拉起来</h2><p>这里集中放最常用的外部工具；手机装了对应 App 会优先尝试打开，没有就回到网页。</p></section><section class=\"tool-grid\"><button class=\"tool-card\" data-action=\"ticket-app\"><span>🚄</span><div><strong>12306</strong><small>购票、候补、订单</small></div><b>打开 ↗</b></button><button class=\"tool-card\" data-action=\"next-map\"><span>⌁</span><div><strong>高德地图</strong><small>下一站导航和停车点</small></div><b>打开 ↗</b></button><button class=\"tool-card\" data-action=\"weather\"><span>☼</span><div><strong>天气查询</strong><small>三江 / 从江 / 黎平</small></div><b>打开 ↗</b></button><button class=\"tool-card\" data-action=\"share\"><span>↗</span><div><strong>同步给同行</strong><small>票务、待办、费用快照</small></div><b>分享 ↗</b></button></section><section class=\"section-block\"><div class=\"section-heading\"><div><p class=\"eyebrow\">旅伴分工</p><h2>不用争谁来记</h2></div><span class=\"label\">两位司机轮换</span></div><div class=\"roles-card\">" + roles + "</div></section><section class=\"safety-card\"><div class=\"safety-icon\">!</div><div><span class=\"label\">出行底线</span><h3>动态信息只做提醒，不替你做决定</h3><p>车次、天气、路况、活动时间和停车变化，出发前及当天再核验。</p></div></section><section class=\"source-card\"><div><span class=\"label\">数据维护</span><h3>固定事实和临时信息分开</h3><p>固定事实写在 trip-data.js；车次、活动、天气和路况属于临时信息，核验后再录入。</p></div><button class=\"text-button\" data-action=\"sources\">打开来源</button></section>";
}

function bindEvents() {
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; save(); render(); }));
  document.querySelectorAll("[data-day-index]").forEach((button) => button.addEventListener("click", () => { state.activeDay = Number(button.dataset.dayIndex); if (button.closest(".route-picker")) state.view = "route"; save(); render(); }));
  document.querySelectorAll("[data-map-query]").forEach((button) => button.addEventListener("click", () => launchMap(decodeURIComponent(button.dataset.mapQuery), button.dataset.mapLabel || "目的地")));
  document.querySelectorAll("[data-stop]").forEach((button) => button.addEventListener("click", () => { const id = button.dataset.stop; state.completedStops[id] = !state.completedStops[id]; save(); render(); }));
  document.querySelectorAll("[data-ticket-save]").forEach((button) => button.addEventListener("click", () => saveTicketDetail(button.dataset.ticketSave)));
  document.querySelectorAll("[data-ticket-copy]").forEach((button) => button.addEventListener("click", () => { const ticket = trip.ticketSales.find((item) => item.id === button.dataset.ticketCopy); if (ticket) copyText(ticketQuery(ticket), "购票条件已复制"); }));
  document.querySelectorAll("[data-expense-delete]").forEach((button) => button.addEventListener("click", () => { state.expenses = state.expenses.filter((item) => item.id !== button.dataset.expenseDelete); save(); render(); showToast("已删除这笔费用"); }));
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => handleAction(button.dataset.action, button)));
  document.querySelectorAll("[data-map]").forEach((button) => button.addEventListener("click", () => window.open(`https://www.amap.com/search?query=${button.dataset.map}`, "_blank", "noopener,noreferrer")));
  document.querySelectorAll("[data-task]").forEach((input) => input.addEventListener("change", () => { const task = state.tasks.find((item) => item.id === input.dataset.task); if (task) task.done = input.checked; save(); render(); }));
  document.querySelectorAll("[data-ticket]").forEach((button) => button.addEventListener("click", () => { const id = button.dataset.ticket; state.ticketStatus[id] = state.ticketStatus[id] === "已购票" ? "待抢票" : "已购票"; save(); render(); showToast(state.ticketStatus[id] === "已购票" ? "已标记为已购票" : "已恢复为待抢票"); }));
  document.querySelectorAll("[data-ticket-wait]").forEach((button) => button.addEventListener("click", () => { const id = button.dataset.ticketWait; state.ticketStatus[id] = state.ticketStatus[id] === "候补中" ? "待抢票" : "候补中"; save(); render(); showToast(state.ticketStatus[id] === "候补中" ? "已标记为候补中" : "已取消候补"); }));
  document.querySelector("#expenseForm")?.addEventListener("submit", (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); state.expenses.push({ id: `expense-${Date.now()}`, title: form.get("title"), amount: Number(form.get("amount")), category: form.get("category"), paidBy: form.get("paidBy") || "未分配" }); save(); render(); showToast("已添加一笔费用"); });
}

function saveTicketDetail(id) {
  const code = [...document.querySelectorAll("[data-ticket-code]")].find((input) => input.dataset.ticketCode === id)?.value.trim() || "";
  const depart = [...document.querySelectorAll("[data-ticket-depart]")].find((input) => input.dataset.ticketDepart === id)?.value || "";
  const arrive = [...document.querySelectorAll("[data-ticket-arrive]")].find((input) => input.dataset.ticketArrive === id)?.value || "";
  state.ticketDetails[id] = { code, depart, arrive };
  if (code) state.ticketStatus[id] = "已购票";
  save();
  render();
  showToast(code ? "车次已保存，并标记为已购票" : "车次信息已更新");
}

function launchMap(query, label) {
  tryOpenApp(mapApp(query), mapWeb(query), label || "目的地");
}

function launch12306() {
  tryOpenApp("train12306://", "https://www.12306.cn/index/", "12306");
}

function handleAction(action, button) {
  if (action === "ticket-app") { launch12306(); return; }
  if (action === "next-map") {
    const item = activeDay().items.find((entry) => entry.placeId);
    if (item?.placeId) { const place = trip.places[item.placeId]; launchMap(place.query, place.name); }
    else showToast("今天没有配置地图地点");
    return;
  }
  if (action === "hotel-map") {
    const stay = trip.stays.find((item) => item.city === activeDay().city) || trip.stays[0];
    launchMap(stay.query, stay.name);
    return;
  }
  if (action === "vehicle-map") { launchMap(trip.vehicle.mapQuery, "从江高铁站租车点"); return; }
  if (action === "weather") { openWeb("https://www.baidu.com/s?wd=" + encodeURIComponent("三江 从江 黎平 国庆天气")); return; }
  if (action === "copy-all-tickets") { copyText(trip.ticketSales.map(ticketQuery).join("\\n"), "三段购票条件已复制"); return; }
  if (action === "copy-ticket") { const ticket = trip.ticketSales.find((item) => item.id === button?.dataset.ticketCopy); if (ticket) copyText(ticketQuery(ticket), "购票条件已复制"); return; }
  if (action === "copy-vehicle") { copyText(trip.vehicle.model + "；" + trip.vehicle.store + "；10/3 10:30—10/5 20:00；" + trip.vehicle.location, "租车信息已复制"); return; }
  if (action === "share") { shareTrip(); return; }
  if (action === "prep") state.view = "prep";
  if (action === "route") state.view = "route";
  if (action === "vehicle") showToast(`${trip.vehicle.model} · ${trip.vehicle.specs}`);
  if (action === "ai") showToast("AI 是可选模块，核心功能不受影响");
  if (action === "sources") window.open(trip.sources[0].url, "_blank", "noopener,noreferrer");
  render();
}

async function shareTrip() {
  const url = shareUrl();
  const shareText = `${trip.title}\n2026/10/2—10/6 · 3人 · 黔东南\n打开链接可同步当前票务、待办和费用状态`;
  if (navigator.share) {
    try { await navigator.share({ title: trip.title, text: shareText, url }); } catch { /* user cancelled */ }
  } else {
    await copyText(shareText + "\n" + url, "共享链接已复制");
  }
}

document.querySelector("#shareButton").addEventListener("click", shareTrip);
installButton?.addEventListener("click", installApp);
updateInstallButton();

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));

try {
  render();
} catch (error) {
  console.error(error);
  app.innerHTML = `<section class="page-title"><p class="eyebrow">原型诊断</p><h2>页面需要刷新一次</h2><p>数据文件已加载，但本次渲染遇到了问题：${String(error?.message || error)}</p></section>`;
}
