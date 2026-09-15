import { renderGuide } from "./guide.js?v=42";
import { renderHandbookPoster } from "./handbook.js?v=42";

export function renderRoute(ctx) {
  const { state, activeDay, trip, escapeHtml } = ctx;
  const day = activeDay();
  const visibleDays = state.showAllDays ? ctx.trip.days : [day];
  return `
    <section class="page-title"><p class="eyebrow">行程</p><h2>按今天的顺序走</h2><p>先看节点和导航；想了解背景、吃什么或临时怎么调整，再展开当天手册。</p></section>
    <div class="day-picker route-picker">${renderDayPicker(ctx)}</div>
    <div class="route-view-actions"><span>${state.showAllDays ? "正在查看完整路线" : "当前显示 " + day.date + " · " + day.city}</span><button class="outline-button" data-action="toggle-days">${state.showAllDays ? "只看当天" : "查看全部 5 天"}</button></div>
    ${state.showAllDays ? "" : renderExecutionFocus(ctx, day)}
    ${state.showAllDays ? "" : renderRouteSummary(day, trip, escapeHtml)}
    <div class="route-list">${visibleDays.map((item) => renderDay(ctx, item)).join("")}</div>
    ${state.showAllDays ? "" : renderGuide(ctx, day)}
    ${state.showAllDays ? "" : renderHandbookPoster(ctx, day)}
    ${state.showAllDays ? "" : renderJournal(ctx, day)}
    ${state.showAllDays ? "" : renderAlternatives(ctx, day)}
  `;
}

function renderJournal(ctx, day) {
  const { state, currentJournal, escapeHtml } = ctx;
  const entry = currentJournal(day.id);
  const photos = Array.isArray(entry.photos) ? entry.photos : [];
  const completed = day.items.filter((item, index) => state.completedStops[`${day.id}-${index}`]).length;
  const photoMarkup = photos.length
    ? `<div class="journal-photos">${photos.map((photo, index) => `<figure class="journal-photo"><img src="${escapeHtml(photo)}" alt="${escapeHtml(day.date)}旅途照片 ${index + 1}"><button type="button" class="journal-photo-delete" data-journal-photo-delete="${escapeHtml(day.id)}" data-photo-index="${index}" aria-label="删除第${index + 1}张照片">×</button></figure>`).join("")}</div>`
    : `<div class="journal-empty-photo"><span>⌁</span><div><strong>还没有留下照片</strong><small>到达一个地方后，拍一张就能留在这一天。</small></div></div>`;
  return `<section class="journal-card"><div class="section-heading"><div><p class="eyebrow">旅途中记录</p><h2>把今天留下来</h2></div><span class="label">${completed}/${day.items.length} 个节点</span></div><p class="journal-intro">照片、感受和备注只服务于这一天；不想写也没关系，先把地点完成就好。</p>${photoMarkup}<div class="journal-photo-actions"><label class="small-button" for="journalPhotoInput">拍一张 / 选照片</label><input id="journalPhotoInput" class="visually-hidden" type="file" accept="image/*" capture="environment" data-journal-photo="${escapeHtml(day.id)}"><span>最多保存 3 张 · 仅保存在本机</span></div><form id="journalForm" data-journal-day="${escapeHtml(day.id)}" class="journal-form"><label><span>今天的感受</span><select name="mood"><option value="">选一个心情</option>${["惊喜，值得记录", "侗寨很松弛", "风景比预期更好", "有点累但很满足", "普通但很舒服"].map((mood) => `<option ${entry.mood === mood ? "selected" : ""}>${mood}</option>`).join("")}</select></label><label><span>留一句备注</span><textarea name="note" rows="3" placeholder="例如：哪一处最喜欢、今天哪里需要下次调整……">${escapeHtml(entry.note || "")}</textarea></label><div class="journal-form-foot"><span>${entry.updatedAt ? `上次保存 ${escapeHtml(entry.updatedAt)}` : "还没有保存过"}</span><button class="primary-button" type="submit">保存今天</button></div></form></section>`;
}

function renderDayPicker(ctx) {
  const { trip, state, escapeHtml } = ctx;
  return trip.days.map((day, index) => `<button class="${index === state.activeDay ? "selected" : ""}" data-day-index="${index}"><span>DAY ${index + 1}</span><strong>${escapeHtml(day.date)}</strong><small>${escapeHtml(day.city)}</small></button>`).join("");
}

function renderRouteSummary(day, trip, escapeHtml) {
  const seen = new Set();
  const waypoints = day.items.filter((item) => item.placeId || ["train", "car", "drive", "transfer"].includes(item.type)).map((item) => {
    const place = item.placeId ? trip.places[item.placeId] : null;
    return place?.name || item.title;
  }).filter((name) => name && !seen.has(name) && seen.add(name)).slice(0, 5);
  const path = waypoints.map((name, index) => `<span class="route-waypoint ${index === 0 ? "first" : ""}"><i>${index + 1}</i><b>${escapeHtml(name)}</b></span>${index < waypoints.length - 1 ? `<span class="route-waypoint-line" aria-hidden="true"></span>` : ""}`).join("");
  return `<section class="route-summary"><div class="route-summary-copy"><span class="label">${escapeHtml(day.date)} · ${escapeHtml(day.city)}</span><h3>${escapeHtml(day.routeInfo.focus)}</h3><div class="route-waypoints">${path}</div><small class="route-map-note">先看地图和节点顺序；具体道路、入口和耗时以实时导航为准</small></div><div class="route-stats"><b>${escapeHtml(day.routeInfo.distance)}</b><span>${escapeHtml(day.routeInfo.travel)}</span><small>${escapeHtml(day.routeInfo.buffer)}</small></div></section><section class="route-map-card"><div class="section-heading"><div><p class="eyebrow">路线地图</p><h2>今天怎么走</h2></div><span class="label">${day.mapPoints?.length || 0} 个点</span></div><div id="routeMap" class="route-map" role="img" aria-label="${escapeHtml(day.date)}路线地图"><div class="route-map-loading"><span class="map-pulse"></span><span>正在加载路线地图</span></div></div><p class="route-map-status" data-route-map-status>地图使用 OpenStreetMap；实际道路、耗时和入口以高德实时导航为准。</p></section>${renderRouteSegments(day, escapeHtml)}`;
}

function renderRouteSegments(day, escapeHtml) {
  const points = day.mapPoints || [];
  const segments = (day.segmentModes || []).map((segment, index) => ({
    ...segment,
    from: points[index],
    to: points[index + 1]
  })).filter((segment) => segment.from && segment.to);
  if (!segments.length) return "";
  const cards = segments.map((segment, index) => {
    const isRail = segment.mode === "rail";
    const action = isRail
      ? `<button class="small-button" data-action="ticket-app">打开 12306 ↗</button>`
      : `<button class="small-button" data-action="route-segment" data-route-mode="${escapeHtml(segment.mode)}" data-route-from="${encodeURIComponent(JSON.stringify(segment.from))}" data-route-to="${encodeURIComponent(JSON.stringify(segment.to))}">${segment.mode === "walk" ? "步行路线 ↗" : "驾车路线 ↗"}</button>`;
    return `<article class="route-segment"><div class="route-segment-head"><span class="route-segment-number">${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(segment.from.label)} <i>→</i> ${escapeHtml(segment.to.label)}</strong><small>${escapeHtml(segment.label)} · ${escapeHtml(segment.detail)}</small></div></div><div class="route-segment-action">${action}</div></article>`;
  }).join("");
  return `<section class="route-segments-card"><div class="section-heading"><div><p class="eyebrow">分段导航</p><h2>需要时，直接打开</h2></div><span class="label">步行 / 驾车 / 高铁</span></div><div class="route-segment-list">${cards}</div><p class="route-segment-note">路线地图负责看全局；分段按钮会把起点、终点和出行方式交给高德实时规划。</p></section>`;
}

function renderExecutionFocus(ctx, day) {
  const { state, trip, escapeHtml } = ctx;
  const nextIndex = day.items.findIndex((item, index) => !state.completedStops[`${day.id}-${index}`]);
  const isComplete = nextIndex < 0;
  const itemIndex = isComplete ? day.items.length - 1 : nextIndex;
  const item = day.items[itemIndex];
  const stopId = `${day.id}-${itemIndex}`;
  const place = item.placeId ? trip.places[item.placeId] : null;
  const action = item.type === "train"
    ? `<button class="outline-button" data-action="ticket-app">打开 12306</button>`
    : place
      ? `<button class="outline-button" data-map-query="${encodeURIComponent(place.query)}" data-map-label="${escapeHtml(place.name)}">开始导航</button>`
      : "";
  return `<section class="execution-focus-card ${isComplete ? "is-complete" : ""}">
    <div class="execution-focus-main"><span class="eyebrow">${isComplete ? "今天的节点" : "现在要做"}</span><div class="execution-focus-title"><span class="execution-focus-time">${escapeHtml(item.time)}</span><h3>${escapeHtml(isComplete ? "今天已按顺序走完" : item.title)}</h3></div><p>${escapeHtml(isComplete ? "可以回看当天手册，或切换到下一天。" : item.detail)}</p></div>
    <div class="execution-focus-actions">${action}<button class="primary-button" data-stop="${stopId}">${isComplete ? "重新打开" : "标记完成"}</button></div>
  </section>`;
}

function renderAlternatives(ctx, day) {
  const { trip, escapeHtml } = ctx;
  const options = trip.alternatives?.[day.id] || [];
  if (!options.length) return "";
  const cards = options.map((option) => `<article class="alternative-item"><span class="alternative-condition">${escapeHtml(option.condition)}</span><h3>${escapeHtml(option.title)}</h3><p>${escapeHtml(option.detail)}</p><div><span>保留：${escapeHtml(option.keep)}</span><span>删减：${escapeHtml(option.drop)}</span></div></article>`).join("");
  return `<section class="alternatives-card"><div class="section-heading"><div><p class="eyebrow">临时变化</p><h2>如果今天不按计划走</h2></div><span class="label">优先保安全</span></div><div class="alternative-list">${cards}</div></section>`;
}

function renderDay(ctx, day) {
  const { escapeHtml, statusBadge } = ctx;
  return `<article class="day-card"><div class="day-header"><div class="day-number">${day.date.split("/")[1]}</div><div><span class="label">${day.weekday} · ${day.city}</span><h3>${day.title}</h3><p>${day.mood}</p></div>${statusBadge(`风险 ${day.risk}`, day.risk === "中" ? "soft" : "warning")}</div><div class="day-items">${day.items.map((item, index) => renderItem(ctx, item, day.id, index)).join("")}</div></article>`;
}

function renderItem(ctx, item, dayId = "day", index = 0) {
  const { trip, state, escapeHtml } = ctx;
  const place = item.placeId ? trip.places[item.placeId] : null;
  const stopId = dayId + "-" + index;
  const done = Boolean(state.completedStops[stopId]);
  const icon = { train: "🚄", transfer: "↗", spot: "⌁", culture: "♫", hotel: "⌂", car: "▣", drive: "→", deadline: "!", food: "◌" }[item.type] || "•";
  const locationAction = place ? `<span class="mini-tag">${escapeHtml(place.tag)}</span><button class="map-button" data-action="place-detail" data-place-id="${escapeHtml(item.placeId)}">详情</button><button class="map-button" data-map-query="${encodeURIComponent(place.query)}" data-map-label="${escapeHtml(place.name)}">导航 ↗</button>` : "";
  const ticketAction = item.type === "train" ? `<button class="map-button" data-action="ticket-app">12306 ↗</button>` : "";
  return `<div class="timeline-item ${done ? "is-done" : ""}"><div class="timeline-dot type-${item.type}">${icon}</div><div class="timeline-main"><span class="item-time">${escapeHtml(item.time)}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p><div class="item-actions">${locationAction}${ticketAction}<button class="stop-button ${done ? "done" : ""}" data-stop="${stopId}">${done ? "已完成" : "完成"}</button></div></div></div>`;
}
