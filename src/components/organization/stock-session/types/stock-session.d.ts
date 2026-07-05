// ===== Item (reuses backend `item` table) =====
export interface ItemCategoryDto {
  id: string;
  name: string;
}

export interface ItemDto {
  id: string;
  categoryId: string;
  category?: ItemCategoryDto | undefined;
  code: string;
  sku: string;
  name: string;
  // Backend maps `price` column to `sellingPrice` JSON field
  sellingPrice: number;
  costPrice: number;
  isActive: boolean;
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
export interface StockSessionItemInputDto {
  itemId: string;
  item?: ItemDto | undefined;
  outQty: number;
  returnQty: number;
}

export interface StockSessionItemDto
  extends Omit<StockSessionItemInputDto, "item"> {
  id: string;
  item?: ItemDto | undefined;
  soldQty: number;
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

export interface PaymentDetailDto
  extends Omit<PaymentDetailInputDto, "referenceNumber" | "notes"> {
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

export interface CashAdjustmentDto
  extends Omit<CashAdjustmentInputDto, "reason"> {
  id: string;
  reason?: string | undefined;
}

// ===== Session =====
export interface OpenStockSessionInputDto {
  employeeId: string;
  date: string; // YYYY-MM-DD
  notes?: string | undefined;
  items: StockSessionItemInputDto[];
}

export interface CloseStockSessionInputDto {
  items: StockSessionItemInputDto[];
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
}
