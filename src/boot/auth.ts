import type { AppType } from '@/router/app-type';
import { useAppStore } from '@/stores/app/app-store';
import { useAuthStore } from '@/stores/authentication/auth-store';
import { boot } from 'quasar/wrappers';

export default boot(({ router }) => {
  const authStore = useAuthStore();
  const appStore = useAppStore();
  router.beforeEach((to, from, next) => {
    const isPublic = to.meta.public;
    const appType = to.meta.appType;
    appStore.setAppType(appType as AppType);

    if (!isPublic && !authStore.authenticationTokenFromCookie()) {
      next(appStore.getDefaultRoute());
      return;
    }
    next();
  });
});
