// Wire types for the payroll feature. Mirrors the backend DTOs
// in pkg/entity/employee_salary.go.

export type EmployeeSalaryComponentType =
  | "MEAL_ALLOWANCE"
  | "ATTENDANCE"
  | "COMMISSION"
  | "BONUS_TARGET";

export type EmployeeSalaryRefSource = "SALES" | "MANUAL" | "ADJUSTMENT";

export interface EmployeeSalaryComponentDto {
  id?: string;
  employeeSalaryId?: string;
  componentType: EmployeeSalaryComponentType;
  amount: number;
  refId?: string;
  refTable?: string;
  refSource?: EmployeeSalaryRefSource;
}

export interface EmployeeSalaryDto {
  id: string;
  adminIdEmployee: string;
  startDate: string;
  endDate: string;
  totalMealAllowance: number;
  totalAttendanceAllowance: number;
  totalCommission: number;
  totalBonusTarget: number;
  totalSalary: number;
  totalCashReceipt: number;
  remainingSalary: number;
  components?: EmployeeSalaryComponentDto[];
}

// One cash_debt row attached to a session's date. Multiple rows
// can share a date, so the session carries a slice rather than a
// single number. Mirrors SimulatePayrollSessionCashDebtDto on the
// backend (pkg/entity/employee_salary.go).
export interface SimulatePayrollSessionCashDebtDto {
  id: string;
  date: string;
  amount: number;
  paymentMethod: "CASH" | "CASHLESS";
  notes: string;
}

export interface SimulatePayrollSessionDto {
  sessionId: string;
  date: string;
  status: string;
  totalSales: number;
  commission: number;
  mealAllowance: number;
  attendance: number;
  bonusTarget: number;
  totalSalary: number;
  cashDebts: SimulatePayrollSessionCashDebtDto[];
}

export interface SimulatePayrollResultDto {
  adminIdEmployee: string;
  startDate: string;
  endDate: string;
  sessions: SimulatePayrollSessionDto[];
  totalMealAllowance: number;
  totalAttendanceAllowance: number;
  totalCommission: number;
  totalBonusTarget: number;
  totalSalary: number;
  totalCashReceipt: number;
  totalCashDebt: number;
  remainingSalary: number;
  sessionCount: number;
}

export interface SimulatePayrollRequest {
  adminIdEmployee: string;
  startDate: string;
  endDate: string;
}

export interface SavePayrollRequest {
  adminIdEmployee: string;
  startDate: string;
  endDate: string;
  totalMealAllowance: number;
  totalAttendanceAllowance: number;
  totalCommission: number;
  totalBonusTarget: number;
  totalSalary: number;
  totalCashReceipt: number;
  components: EmployeeSalaryComponentDto[];
}
