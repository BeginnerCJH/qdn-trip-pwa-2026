import { calculateBalances, calculateSettlements } from "../selectors.js?v=40";

export function renderExpenses(ctx) {
  const { trip, state, escapeHtml, money } = ctx;
  const total = state.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const perPerson = trip.travelers ? total / trip.travelers : 0;
  const unassignedExpenses = state.expenses.filter((item) => !item.paidBy || item.paidBy === "未分配");
  const unassignedTotal = unassignedExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balances = calculateBalances(trip, state);
  const balanceCards = balances.map((item) => `<div class="balance-card"><span>${escapeHtml(item.label)}</span><strong class="${item.net >= 0 ? "positive" : "negative"}">${item.net >= 0 ? "+" : "−"}${money(Math.abs(item.net))}</strong><small>${item.net >= 0 ? "应收回" : "应补交"}</small></div>`).join("");
  const settlements = calculateSettlements(balances);
  const settlementMarkup = settlements.length ? settlements.map((item) => `<div class="settlement-row"><span>${escapeHtml(item.from)}</span><b>→</b><span>${escapeHtml(item.to)}</span><strong>${money(item.amount)}</strong></div>`).join("") : `<p class="empty-hint">目前没有需要结算的金额，先把每笔费用的垫付人补上。</p>`;
  return `
    <section class="page-title"><p class="eyebrow">费用</p><h2>旅途中记一笔</h2><p>先记金额和垫付人，三人分账会自动算好。</p></section>

    <section class="expense-hero"><div><span class="eyebrow">目前共同支出</span><strong>${money(total)}</strong><p>三人平均 ${money(perPerson)} / 人 · ${state.expenses.length} 笔</p></div><span class="expense-hero-mark">¥</span></section>

    <section class="expense-action-card"><div class="section-heading"><div><span class="eyebrow">快速记录</span><h3>新增一笔费用</h3></div><span class="label">默认三人平分</span></div><form id="expenseForm"><input name="title" placeholder="例如：停车费" required /><input name="amount" type="number" min="0" step="0.01" placeholder="金额" required /><select name="category"><option>餐饮</option><option>交通</option><option>门票</option><option>住宿</option><option>其他</option></select><select name="paidBy"><option value="未分配">谁垫付？</option>${trip.members.map((member) => `<option value="${escapeHtml(member.label)}">${escapeHtml(member.label)}</option>`).join("")}</select><button class="primary-button" type="submit">添加</button></form></section>

    <section class="expense-list-card"><div class="section-heading"><div><span class="eyebrow">明细</span><h3>已经记下的费用</h3></div><span class="label">${state.expenses.length} 笔</span></div><div class="expense-list">${state.expenses.map((item) => `<div class="expense-row"><div class="expense-icon">${item.category === "住宿" ? "⌂" : item.category === "交通" ? "→" : "¥"}</div><div class="expense-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.category)}</span></div><select class="expense-payer-select" data-expense-payer="${escapeHtml(item.id)}" aria-label="设置${escapeHtml(item.title)}的垫付人">${payerOptions(trip, item.paidBy, escapeHtml)}</select><b>${money(item.amount)}</b><button class="delete-button" data-expense-delete="${item.id}" aria-label="删除${escapeHtml(item.title)}">×</button></div>`).join("")}</div></section>

    <section class="settlement-card"><div class="section-heading"><div><span class="eyebrow">分账</span><h3>谁先垫付</h3></div><span class="label">平均 ${money(perPerson)} / 人</span></div>${unassignedTotal ? `<div class="allocation-warning"><strong>${money(unassignedTotal)} 尚未分配垫付人</strong><span>补上垫付人后，下面的结算结果才完整。</span></div>` : ""}<div class="balance-grid">${balanceCards}</div><div class="settlement-list"><span class="group-title">建议结算</span>${settlementMarkup}</div></section>
  `;
}

function payerOptions(trip, current, escapeHtml) {
  const selected = current || "未分配";
  return [`<option value="未分配" ${selected === "未分配" ? "selected" : ""}>未分配</option>`, ...trip.members.map((member) => `<option value="${escapeHtml(member.label)}" ${selected === member.label ? "selected" : ""}>${escapeHtml(member.label)}</option>`)].join("");
}
