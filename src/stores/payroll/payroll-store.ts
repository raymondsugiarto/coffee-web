import { api } from "@/boot/axios";
import type { DefaultResponse } from "@/types/response";
import type { PageTableDto } from "@/types/pagination/pagination";
import { defineStore } from "pinia";
import type {
  EmployeeSalaryDto,
  SavePayrollRequest,
  SimulatePayrollRequest,
  SimulatePayrollResultDto,
} from "@/components/organization/payroll/types/payroll";

/**
 * Pinia store for the Payroll page.
 *
 * The page owns the UI state (form values, simulation preview,
 * save dialog). The store just exposes the three operations the
 * page calls: simulate (preview), save (persist), list.
 */
export const usePayrollStore = defineStore("payroll", {
  state: () => ({
    submitting: false,
    runs: [] as EmployeeSalaryDto[],
  }),

  actions: {
    async simulate(
      req: SimulatePayrollRequest,
    ): Promise<SimulatePayrollResultDto> {
      this.submitting = true;
      try {
        const res = await api.post<DefaultResponse<SimulatePayrollResultDto>>(
          "/api/payroll/simulate",
          req,
        );
        return res.data;
      } finally {
        this.submitting = false;
      }
    },

    async save(req: SavePayrollRequest): Promise<EmployeeSalaryDto> {
      this.submitting = true;
      try {
        const res = await api.post<DefaultResponse<EmployeeSalaryDto>>(
          "/api/payroll",
          req,
        );
        return res.data;
      } finally {
        this.submitting = false;
      }
    },

    async fetchRuns(
      query: {
        page?: number;
        size?: number;
        adminIdEmployee?: string;
      } = {},
    ): Promise<void> {
      const params = new URLSearchParams();
      params.set("size", String(query.size ?? 50));
      params.set("page", String(query.page ?? 0));
      if (query.adminIdEmployee) {
        params.set("adminIdEmployee", query.adminIdEmployee);
      }
      const res = await api.get<
        DefaultResponse<PageTableDto<EmployeeSalaryDto>>
      >(`/api/payroll?${params.toString()}`);
      this.runs = res.data.contents;
    },
  },
});
