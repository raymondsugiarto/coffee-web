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
        name: "stock-session-list",
        path: "stock-session",
        component: () =>
          import("@/pages/organization/StockSessionListPage.vue"),
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
      {
        name: "item-category-list",
        path: "catalog/categories",
        component: () =>
          import("@/pages/organization/ItemCategoryListPage.vue"),
        meta: { ...adminPrivateMeta },
      },
      {
        name: "item-list",
        path: "catalog/items",
        component: () => import("@/pages/organization/ItemListPage.vue"),
        meta: { ...adminPrivateMeta },
      },
      {
        name: "salary-component-list",
        path: "payroll/salary-components",
        component: () =>
          import("@/pages/organization/SalaryComponentListPage.vue"),
        meta: { ...adminPrivateMeta },
      },
      {
        name: "payroll",
        path: "payroll",
        component: () => import("@/pages/organization/PayrollPage.vue"),
        meta: { ...adminPrivateMeta },
      },
      {
        name: "cash-debt-list",
        path: "payroll/cash-debts",
        component: () => import("@/pages/organization/CashDebtListPage.vue"),
        meta: { ...adminPrivateMeta },
      },
    ],
  },
];

export default privateRoutes;
