export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function formatRecovery(value: number) {
  const recovery = Number.isFinite(value) ? Math.max(0, value) : 0;
  return recovery === 0 ? "0.0%" : `+${recovery.toFixed(1)}%`;
}

export function formatAthChange(value: number) {
  const change = Number.isFinite(value) ? value : 0;
  if (Math.abs(change) < 0.05) return "0.0%";
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
}
