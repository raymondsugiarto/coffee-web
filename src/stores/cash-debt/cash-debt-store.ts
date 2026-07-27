import { api } from "@/boot/axios";
import type { DefaultResponse } from "@/types/response";
import type { PageTableDto } from "@/types/pagination/pagination";
import { defineStore } from "pinia";
import type {
  CashDebtDto,
  CashDebtListQuery,
} from "@/components/organization/cash_debt/types/cash-debt";

/**
 * Pinia store for the cash_debt ledger page.
 *
 * Mirrors the salary-component-store pattern: page owns the
 * filter UI, store owns the network calls + collection state.
 * After every mutation we re-fetch so the table stays in sync
 * without optimistic updates.
 */
export const useCashDebtStore = defineStore("cashDebt", {
  state: () => ({
    items: [] as CashDebtDto[],
    submitting: false,
  }),

  actions: {
    async fetch(query: CashDebtListQuery = {}): Promise<void> {
      const params = new URLSearchParams();
      params.set("size", String(query.size ?? 200));
      params.set("page", String(query.page ?? 0));
      if (query.adminIdEmployee) {
        params.set("adminIdEmployee", query.adminIdEmployee);
      }
      if (query.from) params.set("from", query.from);
      if (query.to) params.set("to", query.to);
      if (query.paymentMethod) {
        params.set("paymentMethod", query.paymentMethod);
      }
      const res = await api.get<DefaultResponse<PageTableDto<CashDebtDto>>>(
        `/api/cash-debts?${params.toString()}`,
      );
      this.items = res.data.contents;
    },

    async create(payload: Omit<CashDebtDto, "id">): Promise<CashDebtDto> {
      this.submitting = true;
      try {
        const res = await api.post<DefaultResponse<CashDebtDto>>(
          "/api/cash-debts",
          payload,
        );
        await this.fetch();
        return res.data;
      } finally {
        this.submitting = false;
      }
    },

    async update(
      id: string,
      payload: Omit<CashDebtDto, "id">,
    ): Promise<CashDebtDto> {
      this.submitting = true;
      try {
        const res = await api.put<DefaultResponse<CashDebtDto>>(
          `/api/cash-debts/${id}`,
          payload,
        );
        await this.fetch();
        return res.data;
      } finally {
        this.submitting = false;
      }
    },

    async delete(id: string): Promise<void> {
      this.submitting = true;
      try {
        await api.delete<DefaultResponse<{ deleted: string }>>(
          `/api/cash-debts/${id}`,
        );
        await this.fetch();
      } finally {
        this.submitting = false;
      }
    },
  },
});
