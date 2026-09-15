import { trip } from "./trip-data.js?v=41";
import { bindEvents as bindDelegatedEvents } from "./src/events.js?v=41";
import { createShareUrl, createTripState } from "./src/state.js?v=41";
import { selectActiveDay, selectCurrentPhase, selectNextAction, selectOverviewDay, selectTicketCounts, selectTripHeroStatus } from "./src/selectors.js?v=41";
import { daysUntil, escapeHtml, formatDate, money, statusBadge, ticketTone } from "./src/format.js?v=41";
import { fetchWeather } from "./src/weather.js?v=41";
import { mountRouteMap, destroyRouteMap } from "./src/map.js?v=41";
import { renderOverview as renderOverviewView } from "./src/views/overview.js?v=41";
import { renderRoute as renderRouteView } from "./src/views/route.js?v=41";
import { renderPrep as renderPrepView } from "./src/views/prep.js?v=41";
import { renderExpenses as renderExpensesView } from "./src/views/expenses.js?v=41";
import { renderTools as renderToolsView } from "./src/views/tools.js?v=41";

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const installButton = document.querySelector("#installButton");
const liveDateTime = document.querySelector("#liveDateTime");
const liveWeather = document.querySelector("#liveWeather");
const liveWeatherCaption = document.querySelector("#liveWeatherCaption");
let deferredInstallPrompt = null;
const weatherState = { city: "", status: "idle", label: "天气加载中", temperature: "", feelsLike: "", humidity: "", wind: "" };
let weatherRequestId = 0;
let weatherAbortController = null;

function focusedDay() {
  const view = typeof state === "undefined" ? "overview" : state.view;
  return view === "route" ? activeDay() : overviewDay();
}

function currentWeatherCity() {
  return focusedDay()?.city || "三江";
}

function weatherContextLabel(city) {
  const view = typeof state === "undefined" ? "overview" : state.view;
  if (view === "route") return `所选行程 · ${city} · 点击查看`;
  const phase = currentPhase();
  if (phase.tone === "before") return `下一站天气 · ${city} · 点击查看`;
  if (phase.tone === "trip") return `今日目的地 · ${city} · 点击查看`;
  return `目的地天气 · ${city} · 点击查看`;
}

function updateLiveStatus() {
  const now = new Date();
  const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const pad = (value) => String(value).padStart(2, "0");
  if (liveDateTime) liveDateTime.textContent = `${now.getMonth() + 1}月${now.getDate()}日 ${week[now.getDay()]} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  if (liveWeather) {
    const city = currentWeatherCity();
    if (weatherState.status === "ready" && weatherState.city === city) liveWeather.textContent = `${city} · ${weatherState.label} ${weatherState.temperature}`;
    else if (weatherState.status === "error" && weatherState.city === city) liveWeather.textContent = `${city} · 天气暂不可用`;
    else liveWeather.textContent = `${city} · 获取天气中`;
  }
  if (liveWeatherCaption) liveWeatherCaption.textContent = weatherContextLabel(currentWeatherCity());
}

async function refreshWeather() {
  const city = currentWeatherCity();
  const requestId = ++weatherRequestId;
  weatherAbortController?.abort();
  weatherAbortController = new AbortController();
  weatherState.city = city;
  weatherState.status = "loading";
  updateLiveStatus();
  try {
    const result = await fetchWeather(city, { signal: weatherAbortController.signal });
    if (requestId !== weatherRequestId) return;
    Object.assign(weatherState, { status: "ready", ...result });
  } catch (error) {
    if (requestId !== weatherRequestId || error?.name === "AbortError") return;
    weatherState.status = "error";
  }
  updateLiveStatus();
}

function handleModalKeydown(event) {
  if (event.key === "Escape") closeLiveDetails();
}

function closeLiveDetails() {
  document.querySelector(".live-modal")?.remove();
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleModalKeydown);
}

function openPlaceDetails(placeId) {
  const place = trip.places[placeId];
  if (!place) { showToast("这个地点还没有详情"); return; }
  closeLiveDetails();
  const related = trip.days.flatMap((day) => day.items.filter((item) => item.placeId === placeId).map((item) => `${day.date} · ${item.time} · ${item.title}`));
  document.body.insertAdjacentHTML("beforeend", `<div class="live-modal place-modal" role="presentation"><div class="live-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(place.name)}详情"><div class="live-dialog-head"><div><span class="eyebrow">${escapeHtml(place.tag || "行程地点")}</span><h3>${escapeHtml(place.name)}</h3></div><button class="icon-button live-close" type="button" aria-label="关闭详情">×</button></div><div class="place-detail-main"><div class="place-detail-icon">⌁</div><div><strong>${escapeHtml(place.city)} · ${escapeHtml(place.access || "按当天行程进入")}</strong><span>${escapeHtml(place.query)}</span></div></div><div class="place-detail-block"><small>这趟行程中的位置</small><p>${escapeHtml(related.join("；") || "作为备用地点保存")}</p></div><div class="place-detail-block place-detail-tip"><small>出发前提醒</small><p>${escapeHtml(place.tip || "出发前核验当天安排")}</p></div><div class="live-dialog-actions"><button class="outline-button place-open-map" type="button">打开导航</button><button class="primary-button live-close" type="button">知道了</button></div></div></div>`);
  const modal = document.querySelector(".place-modal");
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", handleModalKeydown);
  modal.addEventListener("click", (event) => { if (event.target === modal || event.target.closest(".live-close")) closeLiveDetails(); });
  modal.querySelector(".place-open-map")?.addEventListener("click", () => { closeLiveDetails(); launchMap(place.query, place.name); });
}

function openLiveDetails(kind) {
  closeLiveDetails();
  const day = focusedDay();
  const nextDeadline = day.date === "10/2" ? "10/3 10:30 取车" : "10/5 20:00 还车";
  const isWeather = kind === "weather";
  const weatherContent = weatherState.status === "ready"
    ? `<div class="live-detail-main"><span class="live-detail-icon">☼</span><div><strong>${escapeHtml(weatherState.temperature)} · ${escapeHtml(weatherState.label)}</strong><span>${escapeHtml(weatherState.city)} · 体感 ${escapeHtml(weatherState.feelsLike)}</span></div></div><div class="live-detail-grid"><div><small>湿度</small><b>${escapeHtml(weatherState.humidity)}</b></div><div><small>风速</small><b>${escapeHtml(weatherState.wind)}</b></div><div><small>数据</small><b>实时</b></div></div><p class="live-detail-note">当前天气只代表现在；10 月 2 日出发前，再刷新一次三江、加榜和从江天气更有参考价值。</p>`
    : `<div class="live-detail-main"><span class="live-detail-icon">☼</span><div><strong>${escapeHtml(weatherState.city)} · 天气暂不可用</strong><span>可以稍后重试，或打开天气查询</span></div></div><p class="live-detail-note">网络不可用时不影响行程和离线功能。</p>`;
  const calendarContent = `<div class="live-detail-main"><span class="live-detail-icon">▦</span><div><strong>${escapeHtml(day.date)} · ${escapeHtml(day.weekday)}</strong><span>现在是 ${escapeHtml(liveDateTime?.textContent || "当前时间")}</span></div></div><div class="live-detail-grid"><div><small>当前阶段</small><b>${escapeHtml(currentPhase().label)}</b></div><div><small>当前关注</small><b>${escapeHtml(day.city)}</b></div><div><small>下一硬节点</small><b>${escapeHtml(nextDeadline)}</b></div></div><p class="live-detail-note">首页自动关注当前阶段和对应日期；完整五天安排请进入“行程”。</p>`;
  const searchButton = isWeather ? "<button class=\"outline-button live-search-weather\" type=\"button\">打开天气查询</button>" : "<button class=\"outline-button live-open-route\" type=\"button\">打开当天行程</button>";
  document.body.insertAdjacentHTML("beforeend", `<div class="live-modal" role="presentation"><div class="live-dialog" role="dialog" aria-modal="true" aria-label="${isWeather ? "天气详情" : "日期和行程详情"}"><div class="live-dialog-head"><div><span class="eyebrow">${isWeather ? "实时天气" : "日历信息"}</span><h3>${isWeather ? "天气详情" : "今天要看什么"}</h3></div><button class="icon-button live-close" type="button" aria-label="关闭详情">×</button></div>${isWeather ? weatherContent : calendarContent}<div class="live-dialog-actions">${searchButton}<button class="primary-button live-close" type="button">知道了</button></div></div></div>`);
  const modal = document.querySelector(".live-modal");
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", handleModalKeydown);
  modal.addEventListener("click", (event) => { if (event.target === modal || event.target.closest(".live-close")) closeLiveDetails(); });
  modal.querySelector(".live-search-weather")?.addEventListener("click", () => { closeLiveDetails(); handleAction("weather"); });
  modal.querySelector(".live-open-route")?.addEventListener("click", () => { closeLiveDetails(); state.activeDay = trip.days.indexOf(day); state.view = "route"; save(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); });
}

window.setInterval(updateLiveStatus, 30000);
window.setInterval(refreshWeather, 600000);

function isStandalone() {
  const nativePlatform = window.Capacitor?.getPlatform?.();
  return Boolean(
    window.Capacitor?.isNativePlatform?.() || (nativePlatform && nativePlatform !== "web") ||
    window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true
  );
}

function updateInstallButton() {
  if (!installButton) return;
  if (isStandalone()) {
    installButton.textContent = window.Capacitor?.isNativePlatform?.() ? "App 模式" : "已安装";
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
    showToast(window.Capacitor?.isNativePlatform?.() ? "已经在 Android App 中运行" : "已经在 App 模式运行");
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

const { state, save } = createTripState(trip);

function activeDay() {
  return selectActiveDay(trip, state);
}

function overviewDay() {
  return selectOverviewDay(trip);
}

function currentPhase() {
  return selectCurrentPhase(trip);
}

function ticketCounts() {
  return selectTicketCounts(trip, state);
}

function nextAction() {
  return selectNextAction(trip, state, { formatDate, overviewDay, currentPhase });
}

function currentJournal(dayId) {
  const entry = state.journals?.[dayId] || {};
  return { mood: entry.mood || "", note: entry.note || "", photos: Array.isArray(entry.photos) ? entry.photos : [], updatedAt: entry.updatedAt || "" };
}

function keepJournalContext(dayId) {
  const dayIndex = trip.days.findIndex((day) => day.id === dayId);
  if (dayIndex >= 0) state.activeDay = dayIndex;
  state.view = "route";
  state.showAllDays = false;
}

function saveJournal(dayId, payload) {
  keepJournalContext(dayId);
  const previous = currentJournal(dayId);
  const now = new Date();
  state.journals[dayId] = { ...previous, mood: String(payload.mood || ""), note: String(payload.note || "").trim(), updatedAt: `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` };
  save();
  render();
  showToast("今天的记录已保存");
}

function saveJournalPhoto(dayId, input) {
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      keepJournalContext(dayId);
      const maxSide = 1280;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      const entry = currentJournal(dayId);
      entry.photos = [...entry.photos, canvas.toDataURL("image/jpeg", 0.78)].slice(-3);
      state.journals[dayId] = entry;
      save();
      render();
      showToast("照片已保存到本机");
    };
    image.onerror = () => showToast("这张照片读取失败，请换一张试试");
    image.src = String(reader.result || "");
  };
  reader.onerror = () => showToast("照片读取失败，请重试");
  reader.readAsDataURL(file);
}

function deleteJournalPhoto(dayId, index) {
  keepJournalContext(dayId);
  const entry = currentJournal(dayId);
  if (!Number.isInteger(index) || !entry.photos[index]) return;
  entry.photos.splice(index, 1);
  state.journals[dayId] = entry;
  save();
  render();
  showToast("已移除这张照片");
}

updateLiveStatus();
refreshWeather();

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
    if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch {
    showToast("当前浏览器不允许复制，请手动查看");
  }
}

function ticketQuery(ticket) {
  return ticket.date + " " + ticket.from + " → " + ticket.to + "；" + ticket.window + "；" + trip.preferences.seat;
}

function shareUrl() {
  return createShareUrl(state);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function render() {
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  const viewContext = { trip, state, activeDay, overviewDay, currentPhase, nextAction, currentJournal, tripHeroStatus: () => selectTripHeroStatus(trip, overviewDay, daysUntil), ticketCounts, escapeHtml, formatDate, money, statusBadge, ticketTone };
  const views = { overview: renderOverviewView, route: renderRouteView, prep: renderPrepView, expenses: renderExpensesView, tools: renderToolsView };
  app.innerHTML = views[state.view](viewContext);
  if (state.view === "route" && !state.showAllDays) mountRouteMap(activeDay());
  else destroyRouteMap();
  updateLiveStatus();
  const desiredWeatherCity = currentWeatherCity();
  if (weatherState.city !== desiredWeatherCity && weatherState.status !== "loading") refreshWeather();
  bindDelegatedEvents({ state, trip, overviewDay, save, render, launchMap, saveTicketDetail, saveJournal, saveJournalPhoto, deleteJournalPhoto, copyText, ticketQuery, handleAction, showToast });
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

function launchRouteSegment(button) {
  try {
    const from = JSON.parse(decodeURIComponent(button?.dataset.routeFrom || ""));
    const to = JSON.parse(decodeURIComponent(button?.dataset.routeTo || ""));
    const mode = button?.dataset.routeMode === "walk" ? "walk" : "car";
    const appUrl = `amapuri://route/plan/?from=${from.lon},${from.lat},${encodeURIComponent(from.label)}&to=${to.lon},${to.lat},${encodeURIComponent(to.label)}&dev=0&t=${mode === "walk" ? 2 : 0}`;
    const webUrl = `https://uri.amap.com/navigation?from=${from.lon},${from.lat},${encodeURIComponent(from.label)}&to=${to.lon},${to.lat},${encodeURIComponent(to.label)}&mode=${mode}&coordinate=gps&callnative=0&src=trip-pwa`;
    tryOpenApp(appUrl, webUrl, mode === "walk" ? "步行路线" : "驾车路线");
  } catch {
    showToast("这段路线信息不完整，请直接打开地点导航");
  }
}

function launch12306() {
  tryOpenApp("train12306://", "https://www.12306.cn/index/", "12306");
}

function handleAction(action, button) {
  if (action === "calendar-detail") { openLiveDetails("calendar"); return; }
  if (action === "weather-detail") { openLiveDetails("weather"); return; }
  if (action === "place-detail") { openPlaceDetails(button?.dataset.placeId); return; }
  if (action === "route-segment") { launchRouteSegment(button); return; }
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
  if (action === "toggle-days") { state.showAllDays = !state.showAllDays; render(); return; }
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

if ("serviceWorker" in navigator && !window.Capacitor?.isNativePlatform?.()) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js?v=41").catch(() => {}));

try {
  render();
} catch (error) {
  console.error(error);
  app.innerHTML = `<section class="page-title"><p class="eyebrow">原型诊断</p><h2>页面需要刷新一次</h2><p>数据文件已加载，但本次渲染遇到了问题：${String(error?.message || error)}</p></section>`;
}
