import { api } from "@/boot/axios";
import type { DefaultResponse } from "@/types/response";
import type { PageTableDto } from "@/types/pagination/pagination";
import { defineStore } from "pinia";
import type {
  ItemCategoryDto,
  ItemCategoryListQuery,
  ItemDto,
} from "@/components/organization/stock-session/types/stock-session";

/**
 * Pinia store for the catalog CRUD pages (Items + Item Categories).
 *
 * Two collections, one store — they are tightly coupled (every Item
 * references an ItemCategory), and a single page (e.g. the Item form)
 * often needs both lists at once. Keeping them in the same store lets
 * the catalog page hydrate both with one `init()` call and stay in
 * sync after a CRUD operation.
 */
export const useCatalogStore = defineStore("catalog", {
  state: () => ({
    items: [] as ItemDto[],
    categories: [] as ItemCategoryDto[],
    submitting: false,
  }),

  actions: {
    // ===== Item Category =====

    async fetchCategories(query: ItemCategoryListQuery = {}): Promise<void> {
      const params = new URLSearchParams();
      params.set("size", String(query.size ?? 200));
      params.set("page", String(query.page ?? 0));
      if (query.query) params.set("query", query.query);
      const res = await api.get<DefaultResponse<PageTableDto<ItemCategoryDto>>>(
        `/api/item-categories?${params.toString()}`,
      );
      this.categories = res.data.contents;
    },

    async createCategory(payload: { name: string }): Promise<ItemCategoryDto> {
      this.submitting = true;
      try {
        const res = await api.post<DefaultResponse<ItemCategoryDto>>(
          "/api/item-categories",
          payload,
        );
        await this.fetchCategories();
        return res.data;
      } finally {
        this.submitting = false;
      }
    },

    async updateCategory(
      id: string,
      payload: { name: string },
    ): Promise<ItemCategoryDto> {
      this.submitting = true;
      try {
        const res = await api.put<DefaultResponse<ItemCategoryDto>>(
          `/api/item-categories/${id}`,
          payload,
        );
        await this.fetchCategories();
        return res.data;
      } finally {
        this.submitting = false;
      }
    },

    async deleteCategory(id: string): Promise<void> {
      this.submitting = true;
      try {
        await api.delete<DefaultResponse<{ deleted: string }>>(
          `/api/item-categories/${id}`,
        );
        await this.fetchCategories();
      } finally {
        this.submitting = false;
      }
    },

    // ===== Item =====

    async fetchItems(query: ItemCategoryListQuery = {}): Promise<void> {
      const params = new URLSearchParams();
      params.set("size", String(query.size ?? 200));
      params.set("page", String(query.page ?? 0));
      if (query.query) params.set("query", query.query);
      const res = await api.get<DefaultResponse<PageTableDto<ItemDto>>>(
        `/api/items?${params.toString()}`,
      );
      this.items = res.data.contents;
    },

    async createItem(payload: Omit<ItemDto, "id">): Promise<ItemDto> {
      this.submitting = true;
      try {
        const res = await api.post<DefaultResponse<ItemDto>>(
          "/api/items",
          payload,
        );
        await this.fetchItems();
        return res.data;
      } finally {
        this.submitting = false;
      }
    },

    async updateItem(
      id: string,
      payload: Omit<ItemDto, "id">,
    ): Promise<ItemDto> {
      this.submitting = true;
      try {
        const res = await api.put<DefaultResponse<ItemDto>>(
          `/api/items/${id}`,
          payload,
        );
        await this.fetchItems();
        return res.data;
      } finally {
        this.submitting = false;
      }
    },

    async deleteItem(id: string): Promise<void> {
      this.submitting = true;
      try {
        await api.delete<DefaultResponse<{ deleted: string }>>(
          `/api/items/${id}`,
        );
        await this.fetchItems();
      } finally {
        this.submitting = false;
      }
    },

    /** Best-effort initial load for pages that need both lists. */
    async init(): Promise<void> {
      await Promise.all([this.fetchCategories(), this.fetchItems()]);
    },
  },
});
