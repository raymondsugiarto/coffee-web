import { defineStore } from 'pinia';
import type { UserDto } from './user';
import { api } from '@/boot/axios';
import type { DefaultResponse } from '@/types/response';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserDto | null,
  }),
  getters: {
    getUser: (state) => state.user,
  },
  actions: {
    async loadMyProfile() {
      await api.get<DefaultResponse<UserDto>>('/api/me').then((response) => {
        const { data } = response;
        this.user = data;
      });
    },
  },
});
