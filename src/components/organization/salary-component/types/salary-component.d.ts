// Wire-shape for the SalaryComponent CRUD pages.
// Mirrors the Go entity: `MEAL_ALLOWANCE`, `ATTENDANCE`,
// `BONUS_TARGET`. The Go validator enforces the same enum on the
// server side; the union below lets the form dropdown stay
// type-safe end-to-end.

export type SalaryComponentType =
  | "MEAL_ALLOWANCE"
  | "ATTENDANCE"
  | "BONUS_TARGET";

export interface SalaryComponentDto {
  id: string;
  companyId: string;
  componentType: SalaryComponentType;
  minimumTarget: number;
  amount: number;
}

export interface SalaryComponentListQuery {
  page?: number;
  size?: number;
  companyId?: string;
  componentType?: SalaryComponentType;
}
