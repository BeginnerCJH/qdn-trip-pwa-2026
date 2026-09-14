export function renderTools(ctx) {
  const { trip, escapeHtml } = ctx;
  const roles = trip.members.map((member, index) => `<div class="role-row"><span class="role-number">0${index + 1}</span><div><strong>${escapeHtml(member.label)}</strong><small>${escapeHtml(member.role)}</small></div><span class="role-task">${index === 0 ? "取还车 / 山路" : index === 1 ? "导航 / 备份司机" : "票务 / 记账 / 拍照"}</span></div>`).join("");
  return `
    <section class="page-title"><p class="eyebrow">工具</p><h2>需要时，直接打开</h2><p>票务、导航、天气和分享都集中在这里；地点资料按需展开，不把页面变成资料仓库。</p></section>
    <section class="tool-grid"><button class="tool-card" data-action="ticket-app"><span>🚄</span><div><strong>12306</strong><small>购票 · 候补 · 订单</small></div><b>打开 ↗</b></button><button class="tool-card" data-action="next-map"><span>⌁</span><div><strong>高德地图</strong><small>打开当前行程的下一站</small></div><b>导航 ↗</b></button><button class="tool-card" data-action="weather"><span>☼</span><div><strong>天气查询</strong><small>三江 · 从江 · 黎平</small></div><b>查询 ↗</b></button><button class="tool-card" data-action="share"><span>↗</span><div><strong>同步给同行</strong><small>票务 · 待办 · 费用状态</small></div><b>分享 ↗</b></button></section>
    ${renderPlaceLibrary(ctx)}
    ${renderArchiveIndex(ctx)}
    ${renderDataSources(ctx)}
    <details class="tools-details"><summary>查看旅伴分工和出行底线</summary><div class="tools-details-body"><section class="confirmed-block"><div class="section-heading"><div><p class="eyebrow">旅伴分工</p><h3>不用争谁来记</h3></div><span class="label">两位司机轮换</span></div><div class="roles-card">${roles}</div></section><section class="safety-card"><div class="safety-icon">!</div><div><span class="label">出行底线</span><h3>动态信息只做提醒，不替你做决定</h3><p>车次、天气、路况、活动时间和停车变化，出发前及当天再核验。</p></div></section></div></details>
  `;
}

function renderPlaceLibrary(ctx) {
  const { trip, escapeHtml } = ctx;
  const places = Object.values(trip.places);
  const rows = places.map((place) => {
    const icon = place.tag.includes("住宿") ? "⌂" : place.tag.includes("停车") || place.tag.includes("20:00") ? "▣" : "⌁";
    return `<article class="location-row"><div class="location-icon">${icon}</div><div class="location-copy"><div><span class="mini-tag">${escapeHtml(place.tag)}</span><h3>${escapeHtml(place.name)}</h3></div><p>${escapeHtml(place.city)} · ${escapeHtml(place.access || place.query)}</p><details><summary>查看提醒</summary><div class="location-details"><span>${escapeHtml(place.tip || "出发前核验")}</span><small>${escapeHtml(place.query)}</small></div></details></div><button class="map-button location-map" data-map-query="${encodeURIComponent(place.query)}" data-map-label="${escapeHtml(place.name)}">导航 ↗</button></article>`;
  }).join("");
  return `<section class="locations-card"><div class="section-heading"><div><p class="eyebrow">地点与住宿</p><h2>路上会用到的地点</h2></div><span class="label">${places.length} 个</span></div><p class="locations-hint">酒店订单和路线导航统一放在这里；动态提醒点击后再看。</p><div class="location-list">${rows}</div></section>`;
}

function renderArchiveIndex(ctx) {
  const { trip, escapeHtml } = ctx;
  const guide = trip.guide;
  const foodGroups = Object.entries(guide.foodRankings || {}).map(([group, items]) => `<div class="archive-food-row"><b>${group}级</b><span>${items.map((item) => escapeHtml(item)).join(" · ")}</span></div>`).join("");
  const shopping = (guide.shopping || []).map((item) => `<div class="archive-shopping-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.note)}</span></div>`).join("");
  const roles = (guide.placeRoles || []).map((item) => `<div class="archive-role-row"><strong>${escapeHtml(item.place)}</strong><span>${escapeHtml(item.role)} · ${escapeHtml(item.focus)}</span></div>`).join("");
  const contacts = (guide.contacts || []).map((item) => `<div class="archive-contact-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.use)}</span><b>${escapeHtml(item.phone)}</b></div>`).join("");
  return `<details class="archive-card"><summary><span><em>${escapeHtml(guide.sourceLabel)}</em><strong>旅行资料档案</strong></span><b>${escapeHtml(guide.version)}</b></summary><div class="archive-body"><p class="archive-positioning">${escapeHtml(guide.positioning.statement)} ${escapeHtml(guide.positioning.avoid)}</p><div class="archive-rules">${guide.operatingRules.map((rule) => `<span>· ${escapeHtml(rule)}</span>`).join("")}</div><div class="archive-detail-body"><div><h4>美食优先级</h4><div class="archive-food-list">${foodGroups}</div></div><div><h4>最后一天优先购买</h4><div class="archive-shopping-list">${shopping}</div></div><div><h4>景点在这趟旅行中的角色</h4><div class="archive-role-list">${roles}</div></div><div><h4>公开联系方式</h4><div class="archive-contact-list">${contacts}</div></div></div></div></details>`;
}

function renderDataSources(ctx) {
  const { trip, escapeHtml } = ctx;
  const rows = (trip.dataSources || []).map((source) => `<div class="data-source-row"><span class="data-source-type">${escapeHtml(source.type)}</span><div><strong>${escapeHtml(source.title)}</strong><p>${escapeHtml(source.detail)}</p></div></div>`).join("");
  return `<details class="data-sources-card"><summary><span><em>数据说明</em><strong>这些信息从哪里来？</strong></span><b>查看分层</b></summary><div class="data-source-list">${rows}</div></details>`;
}
