import type { RouteRecordRaw } from 'vue-router';
import privateRoutes from './private-route';
import { publicRoutes } from './public-routes';

const routes: RouteRecordRaw[] = [
  ...privateRoutes,
  ...publicRoutes,
  // {
  //   path: '/',
  //   component: () => import('layouts/MainLayout.vue'),
  //   children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  // },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
