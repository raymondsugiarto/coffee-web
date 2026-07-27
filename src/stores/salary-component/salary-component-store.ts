import { api } from "@/boot/axios";
import type { DefaultResponse } from "@/types/response";
import type { PageTableDto } from "@/types/pagination/pagination";
import { defineStore } from "pinia";
import type {
  SalaryComponentDto,
  SalaryComponentListQuery,
} from "@/components/organization/salary-component/types/salary-component";

/**
 * Pinia store for the salary-component master CRUD page.
 *
 * The store is intentionally minimal — the page handles its own
 * filter UI (company dropdown + component-type dropdown) and just
 * calls fetch() with the current query. After every mutation we
 * re-fetch so the list stays in sync without optimistic updates.
 */
export const useSalaryComponentStore = defineStore("salaryComponent", {
  state: () => ({
    components: [] as SalaryComponentDto[],
    submitting: false,
  }),

  actions: {
    async fetch(query: SalaryComponentListQuery = {}): Promise<void> {
      const params = new URLSearchParams();
      params.set("size", String(query.size ?? 200));
      params.set("page", String(query.page ?? 0));
      if (query.companyId) params.set("companyId", query.companyId);
      if (query.componentType) {
        params.set("componentType", query.componentType);
      }
      const res = await api.get<
        DefaultResponse<PageTableDto<SalaryComponentDto>>
      >(`/api/salary-components?${params.toString()}`);
      this.components = res.data.contents;
    },

    async create(
      payload: Omit<SalaryComponentDto, "id">,
    ): Promise<SalaryComponentDto> {
      this.submitting = true;
      try {
        const res = await api.post<DefaultResponse<SalaryComponentDto>>(
          "/api/salary-components",
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
      payload: Omit<SalaryComponentDto, "id">,
    ): Promise<SalaryComponentDto> {
      this.submitting = true;
      try {
        const res = await api.put<DefaultResponse<SalaryComponentDto>>(
          `/api/salary-components/${id}`,
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
          `/api/salary-components/${id}`,
        );
        await this.fetch();
      } finally {
        this.submitting = false;
      }
    },
  },
});
