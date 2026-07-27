<template>
  <q-list>
    <MainMenuItem :menus="getMenus"></MainMenuItem>
  </q-list>
</template>

<script lang="ts" setup>
import MainMenuItem from "@global/MainMenuItem.vue";
import type { MenuItem } from "./menu";
import { computed } from "vue";
import { AppType } from "@/router/app-type";
import { useUserStore } from "@/stores/user/user-store";

const userStore = useUserStore();

const userType = computed(() => {
  return userStore.getUser?.userType || "ADMIN";
});

const getMenus = computed(() => {
  if (userType.value === "ADMIN") {
    return menus.filter((menu) => menu.appType === AppType.ADMIN);
  } else {
    return menus.filter((menu) => menu.appType === AppType.COMPANY);
  }
});

const menus: MenuItem[] = [
  // {
  //   id: 'dashboard',
  //   label: 'Dashboard',
  //   icon: 'dashboard',
  //   to: '/dashboard',
  //   appType: AppType.ADMIN,
  // },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "dashboard",
    to: "/dashboard",
    expanded: null,
    appType: AppType.ADMIN,
  },
  {
    id: "stock-session",
    label: "Stock Session",
    icon: "local_shipping",
    expanded: true,
    appType: AppType.ADMIN,
    children: [
      {
        id: "list",
        label: "Daftar Sesi",
        icon: "list_alt",
        to: "/stock-session",
      },
      {
        id: "morning",
        label: "Buka Sesi Pagi",
        icon: "wb_sunny",
        to: "/stock-session/morning",
      },
      {
        id: "evening",
        label: "Tutup Sesi Sore",
        icon: "schedule",
        to: "/stock-session/evening",
      },
    ],
  },
  {
    id: "report",
    label: "Laporan",
    icon: "assessment",
    to: "/report",
    expanded: null,
    appType: AppType.ADMIN,
  },
  {
    id: "payroll",
    label: "Payroll",
    icon: "payments",
    expanded: true,
    appType: AppType.ADMIN,
    children: [
      {
        id: "salary-components",
        label: "Komponen Gaji",
        icon: "redeem",
        to: "/payroll/salary-components",
      },
      {
        id: "payroll-run",
        label: "Payroll Run",
        icon: "point_of_sale",
        to: "/payroll",
      },
      {
        id: "cash-debts",
        label: "Cash Debt",
        icon: "request_quote",
        to: "/payroll/cash-debts",
      },
    ],
  },
  {
    id: "catalog",
    label: "Katalog Produk",
    icon: "inventory_2",
    expanded: true,
    appType: AppType.ADMIN,
    children: [
      {
        id: "categories",
        label: "Kategori",
        icon: "category",
        to: "/catalog/categories",
      },
      {
        id: "items",
        label: "Produk",
        icon: "local_cafe",
        to: "/catalog/items",
      },
    ],
  },
  {
    id: "company",
    label: "Transaksi",
    icon: "business",
    to: "/transaction",
    expanded: null,
    appType: AppType.ADMIN,
  },
  // {
  //   id: 'company-dashboard',
  //   label: 'Dashboard',
  //   icon: 'dashboard',
  //   to: '/company/dashboard',
  //   expanded: null,
  //   appType: AppType.COMPANY,
  // },
  // {
  //   id: 'contact',
  //   label: 'Kontak',
  //   icon: 'person',
  //   to: '/company/contact',
  //   expanded: null,
  //   appType: AppType.COMPANY,
  // },
  // {
  //   id: 'project',
  //   label: 'Proyek',
  //   icon: 'work',
  //   to: '/company/project',
  //   expanded: null,
  //   appType: AppType.COMPANY,
  // },
  // {
  //   id: 'activity',
  //   label: 'Aktivitas',
  //   icon: 'assignment',
  //   to: '/company/activity',
  //   expanded: null,
  //   appType: AppType.COMPANY,
  // },
  // {
  //   id: 'realization',
  //   label: 'Realisasi',
  //   icon: 'task_alt',
  //   to: '/company/realization',
  //   expanded: null,
  //   appType: AppType.COMPANY,
  // },
  // {
  //   id: 'project-report',
  //   label: 'Laporan Proyek',
  //   icon: 'assessment',
  //   to: '/company/project-report',
  //   expanded: null,
  //   appType: AppType.COMPANY,
  // },
];
</script>
