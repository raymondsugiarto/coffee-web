// Wire-shape for the cash_debt CRUD. Mirrors the Go DTO.

export type CashDebtPaymentMethod = "CASH" | "CASHLESS";

export interface CashDebtDto {
  id: string;
  adminIdEmployee: string;
  date: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: CashDebtPaymentMethod;
  notes: string;
}

// Build-side accepts `undefined` because callers build this
// with `ref<T | null>` and pass through `?.value ?? undefined`,
// and exactOptionalPropertyTypes forbids assigning `undefined`
// to a bare optional. The store filters falsy values before it
// sends anyway.
export type CashDebtListQuery = {
  page?: number | undefined;
  size?: number | undefined;
  adminIdEmployee?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
  paymentMethod?: CashDebtPaymentMethod | undefined;
};
