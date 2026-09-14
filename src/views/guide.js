export function renderGuide(ctx, day) {
  const { escapeHtml } = ctx;
  const guide = ctx.trip.guide?.days?.[day.id];
  if (!guide) return "";
  const schedule = guide.schedule.map((item) => `<div class="guide-schedule-row"><span>${escapeHtml(item.time)}</span><strong>${escapeHtml(item.text)}</strong></div>`).join("");
  const focus = guide.focus.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const facts = guide.facts.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const verify = guide.verify.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const food = guide.food?.map((item) => `<span>${escapeHtml(item)}</span>`).join("") || "";
  const shopping = guide.shopping?.map((item) => `<span>${escapeHtml(typeof item === "string" ? item : item.name)}</span>`).join("") || "";
  const score = Object.entries(guide.score || {}).map(([label, value]) => `<span><small>${escapeHtml(scoreLabel(label))}</small><b>${escapeHtml(value)}</b></span>`).join("");
  const dayNumber = ctx.trip.days.indexOf(day) + 1;
  return `<section class="guide-card"><div class="guide-card-head"><div><p class="eyebrow">真实资料 · ${escapeHtml(ctx.trip.guide.version)}</p><h3>${escapeHtml(guide.theme)}</h3><p>${escapeHtml(guide.lead)}</p></div><span class="guide-stamp">DAY ${dayNumber}</span></div><div class="guide-route"><span class="guide-route-label">执行方式</span>${escapeHtml(guide.route)}</div><div class="guide-score">${score}</div><details class="guide-details"><summary>查看完整执行手册</summary><div class="guide-detail-body"><div class="guide-schedule"><h4>建议节奏</h4>${schedule}</div><div class="guide-columns"><div><h4>今天重点</h4><ul>${focus}</ul></div><div><h4>必须核验</h4><ul>${verify}</ul></div></div><div class="guide-tags"><div><h4>建议吃</h4><div class="tag-list">${food}</div></div>${shopping ? `<div><h4>可以带</h4><div class="tag-list">${shopping}</div></div>` : ""}</div><div class="guide-facts"><h4>资料事实</h4><ul>${facts}</ul></div><div class="guide-avoid"><strong>不要这样排</strong><span>${escapeHtml(guide.avoid)}</span></div></div></details></section>`;
}

function scoreLabel(label) {
  return ({ natural: "自然", culture: "人文", walk: "徒步", drive: "驾驶", fatigue: "疲劳", photo: "摄影", scheduleRisk: "排程风险", relax: "松弛度" })[label] || label;
}
