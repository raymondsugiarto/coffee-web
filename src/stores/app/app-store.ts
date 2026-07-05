import {
  AppType,
  appTypeAccessTokens,
  appTypeDefaultRoutes,
  appTypePrefixApiUrl,
  appTypeHomePage,
} from '@/router/app-type';
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    appType: AppType.ADMIN,
  }),
  getters: {
    getAppType: (state) => state.appType,
  },
  actions: {
    setAppType(appType: AppType) {
      this.appType = appType;
    },
    getTokenNameByAppType(): string {
      return appTypeAccessTokens[this.appType];
    },
    getDefaultRoute(): string {
      return appTypeDefaultRoutes[this.appType];
    },
    getHomePage(): string {
      return appTypeHomePage[this.appType];
    },
    getPrefixApiUrl(url: string): string {
      return `${appTypePrefixApiUrl[this.appType]}${url}`;
    },
  },
});
