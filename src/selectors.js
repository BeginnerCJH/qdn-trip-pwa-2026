export function selectActiveDay(trip, state) {
  return trip.days[state.activeDay] || trip.days[0];
}

export function selectOverviewDay(trip, now = new Date()) {
  const start = new Date(`${trip.start}T00:00:00+08:00`);
  const end = new Date(`${trip.end}T23:59:59+08:00`);
  if (now < start) return trip.days[0];
  if (now > end) return trip.days[trip.days.length - 1];
  const index = trip.days.findIndex((day) => day.date === `${now.getMonth() + 1}/${now.getDate()}`);
  return trip.days[index >= 0 ? index : 0];
}

export function selectCurrentPhase(trip, now = new Date()) {
  const start = new Date(`${trip.start}T00:00:00+08:00`);
  const end = new Date(`${trip.end}T23:59:59+08:00`);
  if (now < start) return { label: "出发前准备", tone: "before", description: "先把票务和出发资料准备好" };
  if (now <= end) return { label: "旅途中执行", tone: "trip", description: "按当天顺序完成，遇到变化再调整" };
  return { label: "旅行复盘", tone: "after", description: "补充照片、花费和这次路线的经验" };
}

export function selectTicketCounts(trip, state) {
  return {
    purchased: trip.ticketSales.filter((ticket) => state.ticketStatus[ticket.id] === "已购票").length,
    waitlisted: trip.ticketSales.filter((ticket) => state.ticketStatus[ticket.id] === "候补中").length,
    pending: trip.ticketSales.filter((ticket) => state.ticketStatus[ticket.id] === "待抢票").length
  };
}

export function selectNextAction(trip, state, { formatDate, overviewDay, currentPhase }) {
  const phase = currentPhase?.();
  if (phase?.tone === "trip") {
    const day = overviewDay();
    const dayIndex = trip.days.indexOf(day);
    const nextIndex = day.items.findIndex((item, index) => !state.completedStops[`${day.id}-${index}`]);
    if (nextIndex >= 0) {
      const item = day.items[nextIndex];
      return { label: item.title, detail: `${formatDate(day.date)} · ${item.time} · ${item.detail}`, action: "route", dayIndex };
    }
    return { label: "今天已按顺序走完", detail: day.title, action: "route", dayIndex };
  }
  if (phase?.tone === "after") return { label: "整理旅行复盘", detail: "照片、费用和路线经验", action: "expenses" };
  const ticket = trip.ticketSales.find((item) => state.ticketStatus[item.id] === "待抢票");
  if (ticket) return { label: "处理下一段高铁", detail: formatDate(ticket.date) + " · " + ticket.from + " → " + ticket.to, action: "prep" };
  const waitlisted = trip.ticketSales.find((item) => state.ticketStatus[item.id] === "候补中");
  if (waitlisted) return { label: "确认候补出票", detail: formatDate(waitlisted.date) + " · " + waitlisted.from + " → " + waitlisted.to, action: "prep" };
  const task = state.tasks.find((item) => !item.done);
  if (task) return { label: "完成下一项准备", detail: task.label, action: "prep" };
  return { label: "打开当天行程", detail: overviewDay().title, action: "route" };
}

export function selectTripHeroStatus(trip, overviewDay, daysUntil, now = new Date()) {
  const start = new Date(`${trip.start}T00:00:00+08:00`);
  const end = new Date(`${trip.end}T23:59:59+08:00`);
  if (now < start) return { value: daysUntil(trip.start), label: "天后出发" };
  if (now <= end) return { value: `DAY ${trip.days.indexOf(overviewDay()) + 1}`, label: "旅途中" };
  return { value: "已结束", label: "进入复盘" };
}

export const hardDeadlineData = [
  { id: "pickup", at: "2026-10-03T10:30:00+08:00", date: "10/3", time: "10:30", title: "从江高铁站取车", detail: "建议高铁 09:30 左右到达", stopId: "day-2-1" },
  { id: "return", at: "2026-10-05T20:00:00+08:00", date: "10/5", time: "20:00", title: "完成还车", detail: "岜沙距还车点近，目标 19:30 前到店", stopId: "day-4-4" }
];

export function calculateBalances(trip, state) {
  const assignedExpenses = state.expenses.filter((item) => item.paidBy && item.paidBy !== "未分配");
  const share = trip.travelers ? assignedExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0) / trip.travelers : 0;
  return trip.members.map((member) => {
    const paid = assignedExpenses.filter((item) => item.paidBy === member.label).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { label: member.label, net: paid - share };
  });
}

export function calculateSettlements(balances) {
  const debtors = balances.filter((item) => item.net < -0.005).map((item) => ({ ...item, amount: -item.net }));
  const creditors = balances.filter((item) => item.net > 0.005).map((item) => ({ ...item, amount: item.net }));
  const result = [];
  let debtorIndex = 0;
  let creditorIndex = 0;
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const amount = Math.min(debtors[debtorIndex].amount, creditors[creditorIndex].amount);
    result.push({ from: debtors[debtorIndex].label, to: creditors[creditorIndex].label, amount });
    debtors[debtorIndex].amount -= amount;
    creditors[creditorIndex].amount -= amount;
    if (debtors[debtorIndex].amount < 0.005) debtorIndex += 1;
    if (creditors[creditorIndex].amount < 0.005) creditorIndex += 1;
  }
  return result;
}
