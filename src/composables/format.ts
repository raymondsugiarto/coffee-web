// Shared number / currency / date formatters (id-ID locale).
// Use these everywhere instead of inline `Intl.NumberFormat(...)` calls.

const idID = new Intl.NumberFormat("id-ID");

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  return idID.format(Math.round(value));
}

export function formatCurrency(value: number | null | undefined): string {
  return "Rp " + formatNumber(value);
}

export function formatCurrencyDecimal(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || Number.isNaN(value))
    return "Rp 0";
  return (
    "Rp " +
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  );
}

export function formatPercent(
  value: number | null | undefined,
  digits = 1,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "0%";
  return value.toFixed(digits) + "%";
}

export function formatDate(iso: string | Date | undefined | null): string {
  if (!iso) return "-";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(iso: string | Date | undefined | null): string {
  if (!iso) return "-";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function useFormat() {
  return {
    formatNumber,
    formatCurrency,
    formatCurrencyDecimal,
    formatPercent,
    formatDate,
    formatDateTime,
  };
}
