export const STORAGE_KEY = "qdn-trip-state-v3";

function parseState(value) {
  try {
    const parsed = JSON.parse(value || "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function createTripState(trip, location = window.location, storage = window.localStorage) {
  const params = new URLSearchParams(location.search);
  if (params.has("reset")) storage.removeItem(STORAGE_KEY);

  const sharedState = parseState(new URLSearchParams(location.hash.slice(1)).get("state"));
  const stored = parseState(storage.getItem(STORAGE_KEY));
  const seed = sharedState || stored || {};
  const defaultTicketStatus = Object.fromEntries(trip.ticketSales.map((ticket) => [ticket.id, ticket.status]));
  const state = {
    view: "overview",
    mode: seed.mode || "before",
    activeDay: Number.isInteger(seed.activeDay) ? seed.activeDay : 0,
    showAllDays: false,
    tasks: Array.isArray(seed.tasks) ? seed.tasks : trip.initialTasks,
    expenses: Array.isArray(seed.expenses) ? seed.expenses : trip.initialExpenses,
    ticketStatus: { ...defaultTicketStatus, ...(seed.ticketStatus || {}) },
    ticketDetails: seed.ticketDetails || {},
    completedStops: seed.completedStops || {},
    journals: seed.journals && typeof seed.journals === "object" ? seed.journals : {}
  };

  const save = () => {
    storage.setItem(STORAGE_KEY, JSON.stringify({
      mode: state.mode,
      activeDay: state.activeDay,
      tasks: state.tasks,
      expenses: state.expenses,
      ticketStatus: state.ticketStatus,
      ticketDetails: state.ticketDetails,
      completedStops: state.completedStops,
      journals: state.journals
    }));
  };

  if (sharedState) save();
  return { state, sharedState, save };
}

export function createShareUrl(state, location = window.location) {
  const url = new URL(location.href);
  url.searchParams.delete("reset");
  url.hash = "state=" + encodeURIComponent(JSON.stringify({
    mode: state.mode,
    activeDay: state.activeDay,
    tasks: state.tasks,
    expenses: state.expenses,
    ticketStatus: state.ticketStatus,
    ticketDetails: state.ticketDetails,
    completedStops: state.completedStops,
    journals: Object.fromEntries(Object.entries(state.journals || {}).map(([dayId, entry]) => [dayId, {
      mood: entry?.mood || "",
      note: entry?.note || "",
      updatedAt: entry?.updatedAt || ""
    }]))
  }));
  return url.toString();
}
