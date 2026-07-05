import type { RouteRecordRaw } from 'vue-router';
import { adminPublicMeta } from './app-type';
import { CenterLayout } from './layout';

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '',
    component: CenterLayout,
    children: [
      {
        name: 'sign-in',
        path: 'sign-in',
        component: () => import('@/pages/authentication/SignInPage.vue'),
        meta: { ...adminPublicMeta },
      },
    ],
  },
  // {
  //   path: '/company',
  //   component: CenterLayout,
  //   children: [
  //     {
  //       name: 'sign-in-company',
  //       path: 'sign-in',
  //       component: () => import('@/pages/authentication/SignInPage.vue'),
  //       meta: { ...companyPublicMeta },
  //     },
  //   ],
  // },
];

export { publicRoutes };
