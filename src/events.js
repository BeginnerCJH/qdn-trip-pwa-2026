export function bindEvents({ state, trip, overviewDay, save, render, launchMap, saveTicketDetail, saveJournal, saveJournalPhoto, deleteJournalPhoto, copyText, ticketQuery, handleAction, showToast }) {
  if (bindEvents.bound) return;
  bindEvents.bound = true;

  document.addEventListener("click", (event) => {
    const target = event.target?.closest?.("[data-mode], [data-day-index], [data-map-query], [data-stop], [data-ticket-save], [data-ticket-copy], [data-expense-delete], [data-journal-photo-delete], [data-view], [data-action], [data-map], [data-ticket], [data-ticket-wait]");
    if (!target) return;
    if (target.matches("[data-mode]")) { state.mode = target.dataset.mode; save(); render(); return; }
    if (target.matches("[data-day-index]")) {
      state.activeDay = Number(target.dataset.dayIndex);
      if (target.closest(".route-picker") || target.dataset.action === "route") { state.view = "route"; state.showAllDays = false; }
      save(); render();
      return;
    }
    if (target.matches("[data-map-query]")) { launchMap(decodeURIComponent(target.dataset.mapQuery), target.dataset.mapLabel || "目的地"); return; }
    if (target.matches("[data-stop]")) { const id = target.dataset.stop; state.completedStops[id] = !state.completedStops[id]; save(); render(); return; }
    if (target.matches("[data-ticket-save]")) { saveTicketDetail(target.dataset.ticketSave); return; }
    if (target.matches("[data-ticket-copy]")) { const ticket = trip.ticketSales.find((item) => item.id === target.dataset.ticketCopy); if (ticket) copyText(ticketQuery(ticket), "购票条件已复制"); return; }
    if (target.matches("[data-expense-delete]")) { state.expenses = state.expenses.filter((item) => item.id !== target.dataset.expenseDelete); save(); render(); showToast("已删除这笔费用"); return; }
    if (target.matches("[data-journal-photo-delete]")) { deleteJournalPhoto(target.dataset.journalPhotoDelete, Number(target.dataset.photoIndex)); return; }
    if (target.matches("[data-view]")) {
      const nextView = target.dataset.view;
      if (nextView === "route" && state.view !== "route") {
        state.activeDay = Math.max(0, trip.days.indexOf(overviewDay()));
        state.showAllDays = false;
      }
      state.view = nextView;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (target.matches("[data-map]")) { window.open(`https://www.amap.com/search?query=${target.dataset.map}`, "_blank", "noopener,noreferrer"); return; }
    if (target.matches("[data-ticket]")) { const id = target.dataset.ticket; state.ticketStatus[id] = state.ticketStatus[id] === "已购票" ? "待抢票" : "已购票"; save(); render(); showToast(state.ticketStatus[id] === "已购票" ? "已标记为已购票" : "已恢复为待抢票"); return; }
    if (target.matches("[data-ticket-wait]")) { const id = target.dataset.ticketWait; state.ticketStatus[id] = state.ticketStatus[id] === "候补中" ? "待抢票" : "候补中"; save(); render(); showToast(state.ticketStatus[id] === "候补中" ? "已标记为候补中" : "已取消候补"); return; }
    if (target.matches("[data-action]")) { handleAction(target.dataset.action, target); }
  });

  document.addEventListener("change", (event) => {
    const photoInput = event.target?.closest?.("[data-journal-photo]");
    if (photoInput) { saveJournalPhoto(photoInput.dataset.journalPhoto, photoInput); return; }
    const payerInput = event.target?.closest?.("[data-expense-payer]");
    if (payerInput) {
      const expense = state.expenses.find((item) => item.id === payerInput.dataset.expensePayer);
      if (expense) {
        expense.paidBy = payerInput.value || "未分配";
        save();
        render();
        showToast("已更新这笔费用的垫付人");
      }
      return;
    }
    const input = event.target?.closest?.("[data-task]");
    if (!input) return;
    const task = state.tasks.find((item) => item.id === input.dataset.task);
    if (task) task.done = input.checked;
    save();
    render();
  });

  document.addEventListener("submit", (event) => {
    if (event.target?.id === "journalForm") {
      event.preventDefault();
      const form = new FormData(event.target);
      saveJournal(event.target.dataset.journalDay, { mood: form.get("mood") || "", note: form.get("note") || "" });
      return;
    }
    if (event.target?.id !== "expenseForm") return;
    event.preventDefault();
    const form = new FormData(event.target);
    state.expenses.push({ id: `expense-${Date.now()}`, title: form.get("title"), amount: Number(form.get("amount")), category: form.get("category"), paidBy: form.get("paidBy") || "未分配" });
    save();
    render();
    showToast("已添加一笔费用");
  });
}
