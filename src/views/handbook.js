import { handbookForDay, travelHandbook } from "../handbook.js?v=42";

export function renderHandbookPreview(ctx) {
  const { trip, escapeHtml } = ctx;
  const dayCards = trip.days.map((day, index) => {
    const item = handbookForDay(day.id);
    if (!item) return "";
    return `<button class="handbook-day-card" type="button" data-action="route" data-day-index="${index}" aria-label="打开 ${escapeHtml(item.title)}">
      <span class="handbook-day-image"><img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async"></span>
      <span class="handbook-day-copy"><span class="eyebrow">DAY ${index + 1} · ${escapeHtml(day.date)}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.caption)}</small></span>
    </button>`;
  }).join("");
  return `<section class="handbook-preview-card">
    <div class="section-heading handbook-section-heading"><div><p class="eyebrow">旅行手册</p><h2>把这趟旅程看成一组画面</h2><p>路线总览负责建立方向，每一天的长图负责记住节奏；真正要执行的节点仍在下面的行程和准备里。</p></div><span class="label">6 张图</span></div>
    <a class="handbook-cover" href="${travelHandbook.cover.src}" target="_blank" rel="noopener" aria-label="全屏查看${escapeHtml(travelHandbook.cover.title)}">
      <img src="${travelHandbook.cover.src}" alt="${escapeHtml(travelHandbook.cover.alt)}" loading="lazy" decoding="async">
      <span class="handbook-cover-copy"><strong>${escapeHtml(travelHandbook.cover.title)}</strong><small>${escapeHtml(travelHandbook.cover.caption)} · 点击查看大图</small></span>
    </a>
    <div class="handbook-day-grid">${dayCards}</div>
  </section>`;
}

export function renderHandbookPoster(ctx, day) {
  const { escapeHtml } = ctx;
  const item = handbookForDay(day.id);
  if (!item) return "";
  return `<section class="handbook-poster-card">
    <div class="section-heading handbook-section-heading"><div><p class="eyebrow">当天手册 · DAY ${escapeHtml(String(ctx.trip.days.indexOf(day) + 1))}</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.caption)}</p></div><a class="small-button" href="${item.src}" target="_blank" rel="noopener">全屏查看 ↗</a></div>
    <a class="handbook-poster" href="${item.src}" target="_blank" rel="noopener" aria-label="全屏查看${escapeHtml(item.title)}"><img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async"></a>
    <p class="handbook-poster-note">图上的时间轴和建议是旅行节奏参考；车次、天气、路况、活动场次和营业状态仍以出发前及当天核验为准。</p>
  </section>`;
}
