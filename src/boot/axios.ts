import { useAppStore } from '@/stores/app/app-store';
import { useAuthStore } from '@/stores/authentication/auth-store';
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create();

export default boot(({ app, router, store }) => {
  const authStore = useAuthStore(store);
  const appStore = useAppStore(store);

  api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${authStore.getTokenFromCookie()}`;
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error: { code?: string; response?: { status: number; config: { url: string }; data: unknown } }) => {
      if (error.code === 'ERR_NETWORK') {
        // error network
      } else if (error.response?.status === 401) {
        authStore.removeToken();
        // need check if from sign in / public page
        if (!error.response.config.url.startsWith('/api/auth')) {
          void router.push(appStore.getDefaultRoute());
        }
      }
      return Promise.reject(new Error(JSON.stringify(error.response?.data)));
    }
  );

  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
