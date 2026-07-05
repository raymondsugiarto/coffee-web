import { api } from "@/boot/axios";
import type { DefaultResponse } from "@/types/response";
import type { PageTableDto } from "@/types/pagination/pagination";
import { defineStore } from "pinia";
import type {
  CloseStockSessionInputDto,
  DashboardSummaryDto,
  DailyReportDto,
  DriverDto,
  EmployeePerformanceRowDto,
  ItemDto,
  MonthlyReportDto,
  OpenStockSessionInputDto,
  StockSessionDto,
  TopProductRowDto,
} from "@/components/organization/stock-session/types/stock-session";

export const useStockSessionStore = defineStore("stockSession", {
  state: () => ({
    drivers: [] as DriverDto[],
    items: [] as ItemDto[],
    currentSession: null as StockSessionDto | null,
    dashboard: null as DashboardSummaryDto | null,
    sessions: [] as StockSessionDto[],
  }),

  actions: {
    async fetchItems(query = ""): Promise<ItemDto[]> {
      const params = new URLSearchParams();
      params.set("size", "200");
      if (query) params.set("query", query);
      const res = await api.get<DefaultResponse<PageTableDto<ItemDto>>>(
        `/api/products?${params.toString()}`,
      );
      this.items = res.data.contents;
      return res.data.contents;
    },

    async fetchDrivers(query = ""): Promise<DriverDto[]> {
      const params = new URLSearchParams();
      params.set("size", "200");
      if (query) params.set("query", query);
      const res = await api.get<DefaultResponse<PageTableDto<DriverDto>>>(
        `/api/employees?${params.toString()}`,
      );
      this.drivers = res.data.contents;
      return res.data.contents;
    },

    async openSession(
      payload: OpenStockSessionInputDto,
    ): Promise<StockSessionDto> {
      const res = await api.post<DefaultResponse<StockSessionDto>>(
        "/api/stock-session/open",
        payload,
      );
      this.currentSession = res.data;
      return res.data;
    },

    async updateSession(
      id: string,
      payload: OpenStockSessionInputDto,
    ): Promise<StockSessionDto> {
      const res = await api.put<DefaultResponse<StockSessionDto>>(
        `/api/stock-session/${id}`,
        payload,
      );
      this.currentSession = res.data;
      return res.data;
    },

    async getTodaySession(
      employeeId: string,
      date: string,
    ): Promise<StockSessionDto | null> {
      const params = new URLSearchParams();
      params.set("employeeId", employeeId);
      params.set("date", date);
      try {
        const res = await api.get<DefaultResponse<StockSessionDto>>(
          `/api/stock-session/today?${params.toString()}`,
        );
        this.currentSession = res.data;
        return res.data;
      } catch {
        this.currentSession = null;
        return null;
      }
    },

    async getSession(id: string): Promise<StockSessionDto> {
      const res = await api.get<DefaultResponse<StockSessionDto>>(
        `/api/stock-session/${id}`,
      );
      this.currentSession = res.data;
      return res.data;
    },

    async closeSession(
      id: string,
      payload: CloseStockSessionInputDto,
    ): Promise<StockSessionDto> {
      const res = await api.post<DefaultResponse<StockSessionDto>>(
        `/api/stock-session/${id}/close`,
        payload,
      );
      this.currentSession = res.data;
      return res.data;
    },

    async fetchSessions(
      params: URLSearchParams,
    ): Promise<PageTableDto<StockSessionDto>> {
      const res = await api.get<DefaultResponse<PageTableDto<StockSessionDto>>>(
        `/api/stock-session?${params.toString()}`,
      );
      this.sessions = res.data.contents;
      return res.data;
    },

    async fetchDashboard(): Promise<DashboardSummaryDto> {
      const res = await api.get<DefaultResponse<DashboardSummaryDto>>(
        "/api/report/dashboard",
      );
      this.dashboard = res.data;
      return res.data;
    },

    async fetchDailyReport(date: string): Promise<DailyReportDto> {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      const res = await api.get<DefaultResponse<DailyReportDto>>(
        `/api/report/daily?${params.toString()}`,
      );
      return res.data;
    },

    async fetchMonthlyReport(
      year: number,
      month: number,
    ): Promise<MonthlyReportDto> {
      const params = new URLSearchParams();
      if (year) params.set("year", String(year));
      if (month) params.set("month", String(month));
      const res = await api.get<DefaultResponse<MonthlyReportDto>>(
        `/api/report/monthly?${params.toString()}`,
      );
      return res.data;
    },

    async fetchTopProducts(
      from: string,
      to: string,
      limit = 10,
    ): Promise<TopProductRowDto[]> {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      params.set("limit", String(limit));
      const res = await api.get<DefaultResponse<TopProductRowDto[]>>(
        `/api/report/top-products?${params.toString()}`,
      );
      return res.data;
    },

    async fetchEmployeePerformance(
      from: string,
      to: string,
    ): Promise<EmployeePerformanceRowDto[]> {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await api.get<DefaultResponse<EmployeePerformanceRowDto[]>>(
        `/api/report/employee-performance?${params.toString()}`,
      );
      return res.data;
    },
  },
});
