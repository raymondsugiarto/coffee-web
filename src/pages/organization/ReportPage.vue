<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">Laporan</div>
    </div>

    <q-tabs
      v-model="activeTab"
      dense
      align="left"
      class="text-grey-7"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="daily" label="Harian" />
      <q-tab name="monthly" label="Bulanan" />
      <q-tab name="top" label="Produk Terlaris" />
      <q-tab name="performance" label="Performa Driver" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="activeTab" animated class="q-mt-md">
      <!-- Daily -->
      <q-tab-panel name="daily">
        <q-card flat bordered>
          <q-card-section class="row items-center q-gutter-md">
            <q-input
              v-model="dailyDate"
              outlined
              dense
              label="Tanggal"
              mask="####-##-##"
              readonly
            >
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="dailyDate" mask="YYYY-MM-DD" minimal />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-btn
              color="primary"
              unelevated
              icon="refresh"
              label="Muat Ulang"
              no-caps
              @click="loadDaily"
            />
            <q-space />
            <q-btn
              icon="download"
              flat
              label="Export Excel"
              no-caps
              @click="exportCsv('daily')"
            />
            <q-btn
              icon="picture_as_pdf"
              flat
              label="Export PDF"
              no-caps
              @click="exportPdf('daily')"
            />
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col">
                <SummaryBox label="Sesi" :value="dailyReport?.sessions ?? 0" />
              </div>
              <div class="col">
                <SummaryBox
                  label="Total Sales"
                  :value="formatCurrency(dailyReport?.totalSales ?? 0)"
                  color="orange"
                />
              </div>
              <div class="col">
                <SummaryBox
                  label="Cash"
                  :value="formatCurrency(dailyReport?.totalCash ?? 0)"
                  color="green"
                />
              </div>
              <div class="col">
                <SummaryBox
                  label="QRIS"
                  :value="formatCurrency(dailyReport?.totalQris ?? 0)"
                  color="purple"
                />
              </div>
              <div class="col">
                <SummaryBox
                  label="Selisih"
                  :value="formatCurrency(dailyReport?.totalDifference ?? 0)"
                  color="red"
                />
              </div>
            </div>
            <q-table
              :rows="dailyReport?.byEmployee ?? []"
              :columns="employeeColumns"
              row-key="employeeId"
              flat
              dense
              :rows-per-page-options="[0]"
              hide-pagination
            >
              <template #body-cell-totalSales="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.totalSales) }}
                </q-td>
              </template>
              <template #body-cell-totalCash="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.totalCash) }}
                </q-td>
              </template>
              <template #body-cell-totalQris="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.totalQris) }}
                </q-td>
              </template>
              <template #body-cell-difference="props">
                <q-td :props="props" class="text-right text-weight-bold">
                  <span
                    :class="
                      props.row.difference < 0 ? 'text-red-9' : 'text-green-9'
                    "
                  >
                    {{ formatCurrency(props.row.difference) }}
                  </span>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Monthly -->
      <q-tab-panel name="monthly">
        <q-card flat bordered>
          <q-card-section class="row items-center q-gutter-md">
            <q-select
              v-model="monthlyYear"
              :options="yearOptions"
              outlined
              dense
              label="Tahun"
              style="min-width: 120px"
            />
            <q-select
              v-model="monthlyMonth"
              :options="monthOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
              label="Bulan"
              style="min-width: 160px"
            />
            <q-btn
              color="primary"
              unelevated
              icon="refresh"
              label="Muat Ulang"
              no-caps
              @click="loadMonthly"
            />
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col">
                <SummaryBox
                  label="Sesi"
                  :value="monthlyReport?.sessions ?? 0"
                />
              </div>
              <div class="col">
                <SummaryBox
                  label="Total Sales"
                  :value="formatCurrency(monthlyReport?.totalSales ?? 0)"
                  color="orange"
                />
              </div>
              <div class="col">
                <SummaryBox
                  label="Cash"
                  :value="formatCurrency(monthlyReport?.totalCash ?? 0)"
                  color="green"
                />
              </div>
              <div class="col">
                <SummaryBox
                  label="QRIS"
                  :value="formatCurrency(monthlyReport?.totalQris ?? 0)"
                  color="purple"
                />
              </div>
              <div class="col">
                <SummaryBox
                  label="Selisih"
                  :value="formatCurrency(monthlyReport?.totalDifference ?? 0)"
                  color="red"
                />
              </div>
            </div>
            <div class="text-subtitle1 q-mb-sm">Harian</div>
            <q-table
              :rows="monthlyReport?.daily ?? []"
              :columns="dailyColumns"
              row-key="date"
              flat
              dense
              :rows-per-page-options="[0]"
              hide-pagination
            >
              <template #body-cell-totalSales="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.totalSales) }}
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Top Products -->
      <q-tab-panel name="top">
        <q-card flat bordered>
          <q-card-section class="row items-center q-gutter-md">
            <q-input
              v-model="topFrom"
              outlined
              dense
              label="Dari"
              mask="####-##-##"
              readonly
            >
              <template #append
                ><q-icon name="event" class="cursor-pointer"
                  ><q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ><q-date
                      v-model="topFrom"
                      mask="YYYY-MM-DD"
                      minimal /></q-popup-proxy></q-icon
              ></template>
            </q-input>
            <q-input
              v-model="topTo"
              outlined
              dense
              label="Sampai"
              mask="####-##-##"
              readonly
            >
              <template #append
                ><q-icon name="event" class="cursor-pointer"
                  ><q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ><q-date
                      v-model="topTo"
                      mask="YYYY-MM-DD"
                      minimal /></q-popup-proxy></q-icon
              ></template>
            </q-input>
            <q-btn
              color="primary"
              unelevated
              icon="refresh"
              label="Muat Ulang"
              no-caps
              @click="loadTop"
            />
          </q-card-section>
          <q-separator />
          <q-table
            :rows="topProducts"
            :columns="topColumns"
            row-key="productId"
            flat
            dense
            :rows-per-page-options="[10, 20, 50]"
          >
            <template #body-cell-totalSales="props">
              <q-td
                :props="props"
                class="text-right text-weight-bold text-orange-9"
              >
                {{ formatCurrency(props.row.totalSales) }}
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>

      <!-- Performance -->
      <q-tab-panel name="performance">
        <q-card flat bordered>
          <q-card-section class="row items-center q-gutter-md">
            <q-input
              v-model="perfFrom"
              outlined
              dense
              label="Dari"
              mask="####-##-##"
              readonly
            >
              <template #append
                ><q-icon name="event" class="cursor-pointer"
                  ><q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ><q-date
                      v-model="perfFrom"
                      mask="YYYY-MM-DD"
                      minimal /></q-popup-proxy></q-icon
              ></template>
            </q-input>
            <q-input
              v-model="perfTo"
              outlined
              dense
              label="Sampai"
              mask="####-##-##"
              readonly
            >
              <template #append
                ><q-icon name="event" class="cursor-pointer"
                  ><q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                    ><q-date
                      v-model="perfTo"
                      mask="YYYY-MM-DD"
                      minimal /></q-popup-proxy></q-icon
              ></template>
            </q-input>
            <q-btn
              color="primary"
              unelevated
              icon="refresh"
              label="Muat Ulang"
              no-caps
              @click="loadPerformance"
            />
          </q-card-section>
          <q-separator />
          <q-table
            :rows="performance"
            :columns="performanceColumns"
            row-key="employeeId"
            flat
            dense
            :rows-per-page-options="[10, 20, 50]"
          >
            <template #body-cell-totalSales="props">
              <q-td :props="props" class="text-right">{{
                formatCurrency(props.row.totalSales)
              }}</q-td>
            </template>
            <template #body-cell-totalCash="props">
              <q-td :props="props" class="text-right">{{
                formatCurrency(props.row.totalCash)
              }}</q-td>
            </template>
            <template #body-cell-totalQris="props">
              <q-td :props="props" class="text-right">{{
                formatCurrency(props.row.totalQris)
              }}</q-td>
            </template>
            <template #body-cell-totalDifference="props">
              <q-td :props="props" class="text-right text-weight-bold">
                <span
                  :class="
                    props.row.totalDifference < 0
                      ? 'text-red-9'
                      : 'text-green-9'
                  "
                >
                  {{ formatCurrency(props.row.totalDifference) }}
                </span>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { date } from "quasar";
import { onMounted, ref } from "vue";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import type {
  DailyReportDto,
  EmployeePerformanceRowDto,
  MonthlyReportDto,
  TopProductRowDto,
} from "@/components/organization/stock-session/types/stock-session";
import SummaryBox from "@/components/organization/stock-session/SummaryBox.vue";

const store = useStockSessionStore();

const activeTab = ref<"daily" | "monthly" | "top" | "performance">("daily");
const today = date.formatDate(new Date(), "YYYY-MM-DD");
const monthAgo = date.formatDate(
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  "YYYY-MM-DD",
);

const dailyDate = ref(today);
const dailyReport = ref<DailyReportDto | null>(null);

const now = new Date();
const monthlyYear = ref(now.getFullYear());
const monthlyMonth = ref(now.getMonth() + 1);
const monthOptions = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];
const yearOptions = (() => {
  const start = now.getFullYear() - 5;
  const arr: number[] = [];
  for (let y = start; y <= now.getFullYear(); y++) arr.push(y);
  return arr;
})();

const monthlyReport = ref<MonthlyReportDto | null>(null);

const topFrom = ref(monthAgo);
const topTo = ref(today);
const topProducts = ref<TopProductRowDto[]>([]);

const perfFrom = ref(monthAgo);
const perfTo = ref(today);
const performance = ref<EmployeePerformanceRowDto[]>([]);

const employeeColumns: any[] = [
  {
    name: "employeeName",
    label: "Driver",
    field: "employeeName",
    align: "left" as const,
    sortable: true,
  },
  {
    name: "sessions",
    label: "Sesi",
    field: "sessions",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalSales",
    label: "Sales",
    field: "totalSales",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalCash",
    label: "Cash",
    field: "totalCash",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalQris",
    label: "QRIS",
    field: "totalQris",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "difference",
    label: "Selisih",
    field: "difference",
    align: "right" as const,
    sortable: true,
  },
];

const dailyColumns: any[] = [
  {
    name: "date",
    label: "Tanggal",
    field: "date",
    align: "left" as const,
    sortable: true,
  },
  {
    name: "sessions",
    label: "Sesi",
    field: "sessions",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalSales",
    label: "Sales",
    field: "totalSales",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalCash",
    label: "Cash",
    field: "totalCash",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalQris",
    label: "QRIS",
    field: "totalQris",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalDifference",
    label: "Selisih",
    field: "totalDifference",
    align: "right" as const,
    sortable: true,
  },
];

const topColumns: any[] = [
  {
    name: "sku",
    label: "SKU",
    field: "sku",
    align: "left" as const,
    sortable: false,
  },
  {
    name: "productName",
    label: "Produk",
    field: "productName",
    align: "left" as const,
    sortable: true,
  },
  {
    name: "totalQty",
    label: "Qty",
    field: "totalQty",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalSales",
    label: "Sales",
    field: "totalSales",
    align: "right" as const,
    sortable: true,
  },
];

const performanceColumns: any[] = [
  {
    name: "employeeName",
    label: "Driver",
    field: "employeeName",
    align: "left" as const,
    sortable: true,
  },
  {
    name: "sessions",
    label: "Sesi",
    field: "sessions",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalItems",
    label: "Items",
    field: "totalItems",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalSales",
    label: "Sales",
    field: "totalSales",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalCash",
    label: "Cash",
    field: "totalCash",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalQris",
    label: "QRIS",
    field: "totalQris",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalDifference",
    label: "Selisih",
    field: "totalDifference",
    align: "right" as const,
    sortable: true,
  },
];

const loadDaily = async () => {
  dailyReport.value = await store.fetchDailyReport(dailyDate.value);
};
const loadMonthly = async () => {
  monthlyReport.value = await store.fetchMonthlyReport(
    monthlyYear.value,
    monthlyMonth.value,
  );
};
const loadTop = async () => {
  topProducts.value = await store.fetchTopProducts(topFrom.value, topTo.value);
};
const loadPerformance = async () => {
  performance.value = await store.fetchEmployeePerformance(
    perfFrom.value,
    perfTo.value,
  );
};

const formatCurrency = (n: number): string =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n ?? 0));

// Simple CSV / PDF export (browser-side)
const exportCsv = (kind: "daily" | "monthly" | "top" | "performance") => {
  let rows: any[] = [];
  let headers: string[] = [];
  if (kind === "daily") {
    headers = ["Driver", "Sesi", "Sales", "Cash", "QRIS", "Selisih"];
    rows = (dailyReport.value?.byEmployee ?? []).map((r) => ({
      Driver: r.employeeName,
      Sesi: r.sessions,
      Sales: r.totalSales,
      Cash: r.totalCash,
      QRIS: r.totalQris,
      Selisih: r.difference,
    }));
  } else if (kind === "top") {
    headers = ["SKU", "Produk", "Qty", "Sales"];
    rows = topProducts.value.map((r) => ({
      SKU: r.sku,
      Produk: r.productName,
      Qty: r.totalQty,
      Sales: r.totalSales,
    }));
  }
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${r[h] ?? ""}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${kind}-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportPdf = (kind: "daily" | "monthly") => {
  // Lightweight: trigger print dialog
  window.print();
};

onMounted(() => {
  void loadDaily();
  void loadMonthly();
  void loadTop();
  void loadPerformance();
});
</script>
