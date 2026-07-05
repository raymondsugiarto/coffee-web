import { api } from '@/boot/axios';
import { defineStore } from 'pinia';
import { Cookies } from 'quasar';
import { useAppStore } from '../app/app-store';
import type { SignInRequestDto, SignInResponseDto, SignUpRequestDto } from './auth';
import type { DefaultResponse } from '@/types/response';
import { AppType } from '@/router/app-type';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    authenticated: false,
    expiredAt: new Date(),
    comingSoonDialog: 0,
  }),
  getters: {
    getComingSoonDialog: (state) => state.comingSoonDialog,
    getToken: (state) => state.token,
    isAuthenticated: (state) => state.authenticated,
  },
  actions: {
    getCookies() {
      return Cookies;
    },
    getTokenName(): string {
      const appStore = useAppStore();
      return appStore.getTokenNameByAppType();
    },
    authenticationTokenFromCookie(): boolean {
      const token = this.getCookies().get(this.getTokenName());
      if (token) {
        this.token = token;
        this.authenticated = true;
      } else {
        this.authenticated = false;
      }
      return this.authenticated;
    },
    getTokenFromCookie(): string {
      const token = this.getCookies().get(this.getTokenName());
      if (token) {
        this.token = token;
        this.authenticated = true;
      }
      return this.token;
    },
    removeToken() {
      this.getCookies().remove(this.getTokenName(), { path: '/' });
      this.token = '';
      this.authenticated = false;
    },
    setToken(token: string) {
      const dateExpired = new Date(this.expiredAt);
      Cookies.set(this.getTokenName(), token, {
        path: '/',
        expires: dateExpired,
      });
      this.authenticated = true;
    },
    async signOut() {
      this.removeToken();
      const appStore = useAppStore();
      await this.router.replace(appStore.getDefaultRoute());
    },
    signInSuccess(data: SignInResponseDto) {
      this.token = data.token;
      this.expiredAt = data.expiredAt;
      this.setToken(this.token);
    },
    signIn(params: SignInRequestDto) {
      const appStore = useAppStore();
      // need to be check, should not use /api-admin
      return api
        .post<DefaultResponse<SignInResponseDto>>(
          `/api/auth/sign-in`,
          params
        )
        .then((response) => {
          if (response.data.userType === 'COMPANY') {
            appStore.setAppType(AppType.COMPANY);
          } else {
            appStore.setAppType(AppType.ADMIN);
          }
          this.signInSuccess(response.data);
          return response.data;
        });
    },
    signUp(params: SignUpRequestDto) {
      const appStore = useAppStore();
      return api.post(appStore.getPrefixApiUrl('auth/sign-up'), params).then((data) => {
        return data;
      });
    },
    showComingSoonDialog() {
      this.comingSoonDialog += 1;
    },
  },
});
