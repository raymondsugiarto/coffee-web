<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">Dashboard</div>
      <q-space />
      <q-chip color="primary" text-color="white" icon="today">
        {{ today }}
      </q-chip>
    </div>
    <!-- KPI Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-2">
        <SummaryBox
          label="Today's Sales"
          :value="formatCurrency(dashboard?.todaySales ?? 0)"
          color="blue"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <SummaryBox
          label="Today's Cash"
          :value="formatCurrency(dashboard?.todayCash ?? 0)"
          color="green"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <SummaryBox
          label="Today's QRIS"
          :value="formatCurrency(dashboard?.todayQris ?? 0)"
          color="purple"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <SummaryBox
          label="Transactions"
          :value="String(dashboard?.todayTransactions ?? 0)"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <SummaryBox
          label="Open Sessions"
          :value="String(dashboard?.openSessions ?? 0)"
          color="orange"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <SummaryBox
          label="Closed Sessions"
          :value="String(dashboard?.closedSessions ?? 0)"
          color="green"
        />
      </div>
    </div>
    <!-- Quick Actions -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-sm">Quick Actions</div>
        <div class="row q-gutter-sm">
          <q-btn
            color="blue-8"
            unelevated
            icon="wb_sunny"
            label="Buka Sesi Pagi"
            no-caps
            :to="{ name: 'stock-session-morning' }"
          />
          <q-btn
            color="green-8"
            unelevated
            icon="schedule"
            label="Tutup Sesi Sore"
            no-caps
            :to="{ name: 'stock-session-evening' }"
          />
          <q-btn
            color="primary"
            unelevated
            icon="list_alt"
            label="Daftar Sesi"
            no-caps
            :to="{ name: 'stock-session-list' }"
          />
          <q-btn
            color="primary"
            unelevated
            icon="assessment"
            label="Laporan"
            no-caps
            :to="{ name: 'report' }"
          />
        </div>
      </q-card-section>
    </q-card>
    <!-- Sessions table -->
    <q-card flat bordered>
      <q-card-section class="row items-center q-py-sm">
        <div class="text-h6">Sesi Hari Ini</div>
        <q-space />
        <q-btn
          icon="refresh"
          flat
          round
          @click="loadDashboard"
          :loading="loading"
        />
      </q-card-section>
      <q-separator />
      <q-table
        :rows="sessions"
        :columns="columns"
        row-key="id"
        flat
        dense
        :loading="loading"
        :rows-per-page-options="[10, 20, 50]"
      >
        <template #body-cell-employee="props">
          <q-td :props="props">
            {{ props.row.employee?.firstName }}
            {{ props.row.employee?.lastName }}
          </q-td>
        </template>
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="props.row.status === 'OPEN' ? 'orange' : 'green'"
              text-color="white"
              :label="props.row.status"
            />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              icon="schedule"
              flat
              round
              dense
              color="green-8"
              v-if="props.row.status === 'OPEN'"
              :to="{
                name: 'stock-session-evening',
                query: { sessionId: props.row.id },
              }"
            >
              <q-tooltip>Tutup sesi</q-tooltip>
            </q-btn>
            <q-btn
              icon="visibility"
              flat
              round
              dense
              v-else
              :to="{
                name: 'stock-session-evening',
                query: { sessionId: props.row.id },
              }"
            >
              <q-tooltip>Lihat detail</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>
<script setup lang="ts">
import { date } from "quasar";
import type { QTableColumn } from "quasar";
import { onMounted, ref } from "vue";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import { formatCurrency } from "@/composables/format";
import type {
  DashboardSummaryDto,
  StockSessionDto,
} from "@/components/organization/stock-session/types/stock-session";
import SummaryBox from "@/components/organization/stock-session/SummaryBox.vue";
const store = useStockSessionStore();
const loading = ref(false);
const today = date.formatDate(new Date(), "YYYY-MM-DD");
const dashboard = ref<DashboardSummaryDto | null>(null);
const sessions = ref<StockSessionDto[]>([]);
const columns: QTableColumn<StockSessionDto>[] = [
  {
    name: "employee",
    label: "Driver",
    field: (r) =>
      `${r.employee?.firstName ?? ""} ${r.employee?.lastName ?? ""}`.trim(),
    align: "left",
    sortable: true,
  },
  {
    name: "date",
    label: "Tanggal",
    field: "date",
    align: "left",
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    field: "status",
    align: "left",
    sortable: true,
  },
  {
    name: "totalItems",
    label: "Items",
    field: "totalItems",
    align: "right",
    sortable: true,
  },
  {
    name: "totalSales",
    label: "Sales",
    field: "totalSales",
    align: "right",
    sortable: true,
  },
  {
    name: "totalCash",
    label: "Cash",
    field: "totalCash",
    align: "right",
    sortable: true,
  },
  {
    name: "totalQris",
    label: "QRIS",
    field: "totalQris",
    align: "right",
    sortable: true,
  },
  {
    name: "difference",
    label: "Selisih",
    field: "difference",
    align: "right",
    sortable: true,
  },
  {
    name: "actions",
    label: "",
    field: () => "",
    align: "right",
    sortable: false,
  },
];
const loadDashboard = async () => {
  loading.value = true;
  try {
    dashboard.value = await store.fetchDashboard();
    const params = new URLSearchParams();
    params.set("date", today);
    params.set("size", "50");
    const res = await store.fetchSessions(params);
    sessions.value = res.contents;
  } finally {
    loading.value = false;
  }
};
// formatCurrency imported from @/composables/format
onMounted(loadDashboard);
</script>
