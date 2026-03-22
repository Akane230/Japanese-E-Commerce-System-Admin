export function fmt(n, c = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    minimumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtDatetime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
