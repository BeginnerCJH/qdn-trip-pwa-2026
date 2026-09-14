export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

export function money(value) {
  return `¥${Number(value).toLocaleString("zh-CN")}`;
}

export function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00+08:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function daysUntil(dateString, now = new Date()) {
  const target = new Date(`${dateString}T00:00:00+08:00`);
  return Math.max(0, Math.ceil((target - now) / 86400000));
}

export function statusBadge(text, tone = "neutral") {
  return `<span class="badge badge-${tone}">${text}</span>`;
}

export function ticketTone(status) {
  if (status === "已购票") return "success";
  if (status === "候补中") return "warning";
  return "coral";
}
