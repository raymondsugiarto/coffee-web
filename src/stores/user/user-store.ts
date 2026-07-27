import { defineStore } from "pinia";
import type { UserDto } from "./user";
import { api } from "@/boot/axios";
import type { DefaultResponse } from "@/types/response";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as UserDto | null,
  }),
  getters: {
    getUser: (state) => state.user,
  },
  actions: {
    async loadMyProfile(): Promise<void> {
      // Wrap in try/catch — Vue calls this from the router-mounted
      // MainLayout and an unauthenticated 401 / network blip here
      // would otherwise surface as "Unhandled error during execution
      // of mounted hook". The axios boot already handles 401 → sign-out
      // via the response interceptor; here we just swallow everything
      // else (e.g. transient network failures) so the page stays up.
      try {
        const response = await api.get<DefaultResponse<UserDto>>("/api/me");
        this.user = response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.debug("loadMyProfile skipped:", message);
      }
    },
  },
});
