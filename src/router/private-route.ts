import type { RouteRecordRaw } from "vue-router";
import { adminPrivateMeta } from "./app-type";
import MainLayout from "src/layouts/MainLayout.vue";

const privateRoutes: RouteRecordRaw[] = [
  {
    path: "",
    component: MainLayout,
    meta: { ...adminPrivateMeta },
    children: [
      {
        name: "dashboard",
        path: "dashboard",
        component: () => import("@/pages/organization/DashboardPage.vue"),
        meta: { ...adminPrivateMeta },
      },
      {
        name: "transaction",
        path: "transaction",
        component: () => import("@/pages/organization/OrderPage.vue"),
        meta: { ...adminPrivateMeta },
      },
      {
        name: "stock-session-morning",
        path: "stock-session/morning",
        component: () =>
          import("@/pages/organization/StockSessionMorningPage.vue"),
        meta: { ...adminPrivateMeta },
      },
      {
        name: "stock-session-evening",
        path: "stock-session/evening",
        component: () =>
          import("@/pages/organization/StockSessionEveningPage.vue"),
        meta: { ...adminPrivateMeta },
      },
      {
        name: "report",
        path: "report",
        component: () => import("@/pages/organization/ReportPage.vue"),
        meta: { ...adminPrivateMeta },
      },
    ],
  },
];

export default privateRoutes;
