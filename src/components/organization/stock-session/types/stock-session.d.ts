// ===== Item (reuses backend `item` table) =====
export interface ItemCategoryDto {
  id: string;
  name: string;
}

export interface ItemDto {
  id: string;
  categoryId: string;
  category?: ItemCategoryDto | undefined;
  parentId?: string;
  parent?: ItemDto | undefined;
  companyId?: string;
  code: string;
  sku: string;
  name: string;
  // Backend maps `price` column to `sellingPrice` JSON field
  sellingPrice: number;
  costPrice: number;
  commision: number;
  isActive: boolean;
}

// Wire-shape used by the catalog CRUD pages.
export interface ItemCategoryListQuery {
  page?: number;
  size?: number;
  query?: string;
  sortBy?: string;
  descending?: boolean;
}

// ===== Driver (Employee) =====
export interface DriverDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  adminType: string;
}

// ===== Session Item =====
//
// Open and Close each have their own wire shape — they carry
// different fields because they represent different moments in the
// session lifecycle:
//
//   OpenStockSessionItemInputDto  : morning count (OutQty) +
//                                   optional nested Item. ReturnQty
//                                   is normally 0 at open time.
//   CloseStockSessionItemInputDto : delta only — CashSoldQty +
//                                   CashlessSoldQty + ReturnQty.
//                                   OutQty is NOT sent because it
//                                   is already persisted on the
//                                   session row from open.
//
// The backend reconstructs SoldQty = Cash + Cashless and
// OutQty = SoldQty + ReturnQty on close, and revalidates against
// the morning count.
export interface OpenStockSessionItemInputDto {
  itemId: string;
  item?: ItemDto | undefined;
  outQty: number;
  returnQty: number;
}

export interface CloseStockSessionItemInputDto {
  itemId: string;
  cashSoldQty: number;
  cashlessSoldQty: number;
  returnQty: number;
}

// StockSessionItemInputDto is the canonical internal shape used
// inside the form state. It carries every field that the
// StockSessionItemDto persists, so the UI can read everything off
// a single row object. `soldQty` is kept here as a derived value
// (cashSoldQty + cashlessSoldQty) so downstream readers
// (subtotal, table column) keep working without fan-out.
export interface StockSessionItemInputDto {
  itemId: string;
  item?: ItemDto | undefined;
  outQty: number;
  returnQty: number;
  soldQty: number;
  cashSoldQty: number;
  cashlessSoldQty: number;
}

export interface StockSessionItemDto extends Omit<
  StockSessionItemInputDto,
  "item"
> {
  id: string;
  item?: ItemDto | undefined;
  sellingPriceSnapshot: number;
  costPriceSnapshot: number;
  subtotal: number;
}

// ===== Payment =====
export interface PaymentDetailInputDto {
  paymentMethod: "CASH" | "QRIS" | "TRANSFER" | "OTHER";
  amount: number;
  referenceNumber?: string | undefined;
  notes?: string | undefined;
}

export interface PaymentDetailDto extends Omit<
  PaymentDetailInputDto,
  "referenceNumber" | "notes"
> {
  id: string;
  referenceNumber?: string | undefined;
  notes?: string | undefined;
}

// ===== Adjustment =====
export interface CashAdjustmentInputDto {
  type: "SHORTAGE" | "OVERAGE";
  amount: number;
  reason?: string | undefined;
}

export interface CashAdjustmentDto extends Omit<
  CashAdjustmentInputDto,
  "reason"
> {
  id: string;
  reason?: string | undefined;
}

// ===== Session =====
export interface OpenStockSessionInputDto {
  employeeId: string;
  date: string; // YYYY-MM-DD
  notes?: string | undefined;
  items: OpenStockSessionItemInputDto[];
}

export interface CloseStockSessionInputDto {
  items: CloseStockSessionItemInputDto[];
  payments: PaymentDetailInputDto[];
  adjustments?: CashAdjustmentInputDto[] | undefined;
  notes?: string | undefined;
}

export interface StockSessionDto {
  id: string;
  employeeId: string;
  employee?: DriverDto | undefined;
  date: string;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string | undefined;
  totalSales: number;
  totalCash: number;
  totalQris: number;
  totalOther: number;
  totalPayment: number;
  difference: number;
  totalItems: number;
  notes: string;
  createdBy: string;
  // cashDebt is the operator-entered amount the driver owes the
  // company at close.
  cashDebt: number;
  // Salary breakdown resolved on close from the employee's
  // salary_components. Surface-ready even when status is OPEN —
  // the backend re-computes on every write so the value tracks
  // salary_component edits without an explicit recompute call.
  mealAllowance: number;
  attendance: number;
  bonusTarget: number;
  totalSalary: number;
  totalCommission: number;
  items: StockSessionItemDto[];
  payments: PaymentDetailDto[];
  adjustments: CashAdjustmentDto[];
}

// ===== Reports =====
export interface DashboardSummaryDto {
  todaySales: number;
  todayCash: number;
  todayQris: number;
  todayTransactions: number;
  openSessions: number;
  closedSessions: number;
  totalSessions: number;
}

export interface EmployeeReportRowDto {
  employeeId: string;
  employeeName: string;
  sessions: number;
  totalSales: number;
  totalCash: number;
  totalQris: number;
  difference: number;
  commission: number;
  mealAllowance: number;
  bonusTarget: number;
  totalSalary: number;
}

export interface DailyReportDto {
  date: string;
  sessions: number;
  totalSales: number;
  totalCash: number;
  totalQris: number;
  totalOther: number;
  totalPayment: number;
  totalDifference: number;
  totalCommission: number;
  totalMealAllowance: number;
  totalBonusTarget: number;
  totalSalary: number;
  byEmployee: EmployeeReportRowDto[];
}

export interface MonthlyReportDto {
  year: number;
  month: number;
  sessions: number;
  totalSales: number;
  totalCash: number;
  totalQris: number;
  totalDifference: number;
  totalCommission: number;
  totalMealAllowance: number;
  totalBonusTarget: number;
  totalSalary: number;
  daily: DailyReportDto[];
  byEmployee: EmployeeReportRowDto[];
}

export interface TopProductRowDto {
  productId: string;
  productName: string;
  sku: string;
  totalQty: number;
  totalSales: number;
}

export interface EmployeePerformanceRowDto {
  employeeId: string;
  employeeName: string;
  sessions: number;
  totalItems: number;
  totalSales: number;
  totalCash: number;
  totalQris: number;
  totalDifference: number;
  commission: number;
  mealAllowance: number;
  bonusTarget: number;
  totalSalary: number;
}
