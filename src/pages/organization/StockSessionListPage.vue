<template>
  <q-page :padding="$q.screen.gt.xs ? true : false" class="session-list-page">
    <!-- ====== Header ====== -->
    <div class="row items-center q-mb-md q-px-sm q-px-md-none">
      <q-btn flat round icon="arrow_back" :to="{ name: 'dashboard' }" />
      <div class="text-h6 text-h5-sm text-weight-bold q-ml-sm">Daftar Sesi</div>
      <q-space />
      <q-btn
        unelevated
        color="primary"
        icon="wb_sunny"
        label="Buka Sesi Pagi"
        no-caps
        class="gt-xs"
        :to="{ name: 'stock-session-morning' }"
      />
    </div>

    <div class="q-px-sm q-px-md-none">
      <!-- ====== Filters ====== -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="q-pa-md">
          <div class="row items-center q-mb-sm">
            <q-icon
              name="filter_alt"
              size="20px"
              color="primary"
              class="q-mr-xs"
            />
            <div class="text-subtitle1 text-weight-medium">Filter</div>
            <q-space />
            <q-btn
              flat
              dense
              no-caps
              color="grey-8"
              icon="refresh"
              label="Reset"
              @click="resetFilters"
            />
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="filters.from"
                outlined
                dense
                label="Dari Tanggal"
                readonly
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="filters.from"
                        mask="YYYY-MM-DD"
                        minimal
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="filters.to"
                outlined
                dense
                label="Sampai Tanggal"
                readonly
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="filters.to" mask="YYYY-MM-DD" minimal />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                emit-value
                map-options
                outlined
                dense
                label="Status"
                clearable
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filters.employeeId"
                :options="driverOptions"
                option-value="id"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                label="Driver"
                use-input
                input-debounce="300"
                clearable
                @filter="filterDrivers"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Tidak ada driver
                    </q-item-section>
                  </q-item>
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>
                        {{ scope.opt.firstName }} {{ scope.opt.lastName }}
                      </q-item-label>
                      <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <div class="row items-center q-mt-sm q-gutter-sm">
            <div class="text-caption text-grey-7">
              Menampilkan {{ rows.length }} dari {{ rowsNumber }} sesi
            </div>
            <q-space />
            <q-btn
              unelevated
              color="primary"
              icon="search"
              label="Terapkan"
              no-caps
              :loading="loading"
              @click="applyFilters"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- ====== Mobile card list ====== -->
      <div v-if="$q.screen.lt.md" class="mobile-session-list">
        <div v-if="!loading && rows.length === 0" class="empty-state">
          <q-icon name="event_busy" size="56px" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-sm">
            Tidak ada sesi ditemukan
          </div>
          <div class="text-caption text-grey-5">
            Coba ubah filter atau rentang tanggal
          </div>
        </div>
        <div v-for="row in rows" :key="row.id" class="mobile-session-card">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-weight-medium ellipsis">
                {{ driverName(row) }}
              </div>
              <div class="text-caption text-grey-7">
                {{ row.date }} · {{ formatDateTime(row.openedAt) }}
              </div>
            </div>
            <q-chip
              :color="row.status === 'OPEN' ? 'orange' : 'green-8'"
              text-color="white"
              dense
              :icon="row.status === 'OPEN' ? 'lock_open' : 'lock'"
              :label="row.status"
            />
          </div>

          <div class="row q-mt-sm items-center">
            <div class="col-4 text-caption text-grey-7">Item</div>
            <div class="col text-weight-medium">{{ row.totalItems }}</div>
          </div>
          <div class="row items-center">
            <div class="col-4 text-caption text-grey-7">Penjualan</div>
            <div class="col text-weight-bold text-blue-9">
              {{ formatCurrency(row.totalSales) }}
            </div>
          </div>
          <!--
            Mobile salary breakdown — mirrors the desktop table so
            the operator doesn't lose visibility when scrolling on
            a phone. The four lines mirror the four "salary"
            columns in the q-table.
          -->
          <div class="row items-center">
            <div class="col-4 text-caption text-grey-7">Komisi</div>
            <div class="col text-weight-medium">
              {{ formatCurrency(row.totalCommission) }}
            </div>
          </div>
          <div class="row items-center">
            <div class="col-4 text-caption text-grey-7">Meal Allowance</div>
            <div class="col text-orange-9">
              {{ formatCurrency(row.mealAllowance) }}
            </div>
          </div>
          <div class="row items-center">
            <div class="col-4 text-caption text-grey-7">Bonus Target</div>
            <div class="col text-purple-9">
              {{ formatCurrency(row.bonusTarget) }}
            </div>
          </div>
          <div class="row items-center q-mt-xs">
            <div class="col-4 text-caption text-grey-7">Total Salary</div>
            <div class="col text-weight-bold text-red-9">
              {{ formatCurrency(row.totalSalary) }}
            </div>
          </div>
          <div v-if="row.closedAt" class="row items-center">
            <div class="col-4 text-caption text-grey-7">Ditutup</div>
            <div class="col text-caption">
              {{ formatDateTime(row.closedAt) }}
            </div>
          </div>

          <div class="row q-mt-sm q-gutter-sm">
            <q-btn
              v-if="row.status === 'OPEN'"
              unelevated
              color="primary"
              icon="lock"
              label="Tutup Sesi"
              no-caps
              class="col"
              size="sm"
              :to="{
                name: 'stock-session-evening',
                query: { sessionId: row.id },
              }"
            />
            <q-btn
              v-else
              flat
              color="primary"
              icon="visibility"
              label="Lihat"
              no-caps
              class="col"
              size="sm"
              :to="{
                name: 'stock-session-evening',
                query: { sessionId: row.id },
              }"
            />
          </div>
        </div>
        <div v-if="loading" class="row justify-center q-pa-md">
          <q-spinner-dots size="40px" color="primary" />
        </div>
      </div>

      <!-- ====== Desktop table ====== -->
      <q-card v-else flat bordered>
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :rows-per-page-options="[10, 20, 50]"
          v-model:pagination="pagination"
          :rows-number="rowsNumber"
          @request="onRequest"
        >
          <template #body-cell-date="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.date }}</div>
              <div class="text-caption text-grey-7">
                {{ shortWeekday(props.row.date) }}
              </div>
            </q-td>
          </template>
          <template #body-cell-driver="props">
            <q-td :props="props">
              <div class="text-weight-medium">
                {{ driverName(props.row) }}
              </div>
              <div class="text-caption text-grey-7">
                {{ props.row.employee?.email }}
              </div>
            </q-td>
          </template>
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.status === 'OPEN' ? 'orange' : 'green-8'"
                text-color="white"
                dense
                :icon="props.row.status === 'OPEN' ? 'lock_open' : 'lock'"
                :label="props.row.status"
                class="text-weight-bold"
              />
            </q-td>
          </template>
          <template #body-cell-totalSales="props">
            <q-td :props="props" class="text-right text-weight-bold">
              {{ formatCurrency(props.row.totalSales) }}
            </q-td>
          </template>
          <!--
            Salary breakdown columns. Each cell renders its own
            number so the row stays scannable without expanding
            anything. `totalSalary` is bolded because it's the
            headline number (sum of all three components +
            commission + attendance).
          -->
          <template #body-cell-totalCommission="props">
            <q-td :props="props" class="text-right">
              {{ formatCurrency(props.row.totalCommission) }}
            </q-td>
          </template>
          <template #body-cell-mealAllowance="props">
            <q-td :props="props" class="text-right text-orange-9">
              {{ formatCurrency(props.row.mealAllowance) }}
            </q-td>
          </template>
          <template #body-cell-bonusTarget="props">
            <q-td :props="props" class="text-right text-purple-9">
              {{ formatCurrency(props.row.bonusTarget) }}
            </q-td>
          </template>
          <template #body-cell-totalSalary="props">
            <q-td :props="props" class="text-right text-weight-bold text-red-9">
              {{ formatCurrency(props.row.totalSalary) }}
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                v-if="props.row.status === 'OPEN'"
                unelevated
                color="primary"
                icon="lock"
                label="Tutup"
                no-caps
                size="sm"
                :to="{
                  name: 'stock-session-evening',
                  query: { sessionId: props.row.id },
                }"
              />
              <q-btn
                v-else
                flat
                color="primary"
                icon="visibility"
                label="Lihat"
                no-caps
                size="sm"
                :to="{
                  name: 'stock-session-evening',
                  query: { sessionId: props.row.id },
                }"
              />
            </q-td>
          </template>
          <template #no-data>
            <div class="text-center q-pa-md text-grey-6">
              Tidak ada sesi ditemukan untuk filter saat ini.
            </div>
          </template>
        </q-table>
      </q-card>

      <!-- FAB on mobile to open a new morning session -->
      <q-page-sticky
        v-if="$q.screen.lt.md"
        position="bottom-right"
        :offset="[16, 16]"
      >
        <q-btn
          fab
          color="primary"
          icon="wb_sunny"
          :to="{ name: 'stock-session-morning' }"
        >
          <q-tooltip anchor="top middle" self="bottom middle">
            Buka Sesi Pagi
          </q-tooltip>
        </q-btn>
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { date, useQuasar, type QTableColumn } from "quasar";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import { formatCurrency, formatDateTime } from "@/composables/format";
import type { QTablePropsOnRequestPagination } from "@/composables/pagination/pagination.dto";
import type {
  DriverDto,
  StockSessionDto,
} from "@/components/organization/stock-session/types/stock-session";

const $q = useQuasar();
const store = useStockSessionStore();

interface SessionRow {
  id: string;
  date: string;
  employeeId: string;
  employee?: DriverDto | undefined;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string | undefined;
  totalItems: number;
  totalSales: number;
  // Salary breakdown surfaced in the list so the operator can
  // eyeball the per-session numbers without opening the close
  // form. `totalCommission` is included alongside the salary
  // totals because it's the largest contributor to `totalSalary`
  // for most drivers — pairing them on the same row keeps the
  // mental model aligned with the Payroll simulator output.
  mealAllowance: number;
  attendance: number;
  bonusTarget: number;
  totalSalary: number;
  totalCommission: number;
}

const todayIso = date.formatDate(new Date(), "YYYY-MM-DD");
const monthAgoIso = date.formatDate(
  date.subtractFromDate(new Date(), { days: 30 }),
  "YYYY-MM-DD",
);

const filters = reactive({
  from: monthAgoIso,
  to: todayIso,
  status: null as "OPEN" | "CLOSED" | null,
  employeeId: null as string | null,
});

const drivers = ref<DriverDto[]>([]);
const rows = ref<SessionRow[]>([]);
const rowsNumber = ref(0);
const loading = ref(false);

const pagination = ref<QTablePropsOnRequestPagination>({
  sortBy: "date",
  descending: true,
  page: 1, // q-table is 1-based — see buildParams for backend translation
  rowsPerPage: 20,
});

const statusOptions = [
  { label: "Semua Status", value: null },
  { label: "Terbuka", value: "OPEN" as const },
  { label: "Selesai", value: "CLOSED" as const },
];

const driverOptions = computed(() =>
  drivers.value.map((d) => ({
    id: d.id,
    label: `${d.firstName} ${d.lastName}`.trim() || d.email,
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email,
  })),
);

const columns: QTableColumn<SessionRow>[] = [
  {
    name: "date",
    label: "Tanggal",
    field: "date",
    align: "left",
    sortable: true,
  },
  {
    name: "driver",
    label: "Driver",
    field: (r: SessionRow) =>
      r.employee
        ? `${r.employee.firstName} ${r.employee.lastName}`.trim()
        : r.employeeId,
    align: "left",
    sortable: false,
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
    label: "Item",
    field: "totalItems",
    align: "right",
    sortable: true,
  },
  {
    name: "totalSales",
    label: "Penjualan",
    field: "totalSales",
    align: "right",
    sortable: true,
  },
  {
    name: "totalCommission",
    label: "Komisi",
    field: "totalCommission",
    align: "right",
    sortable: true,
  },
  {
    name: "mealAllowance",
    label: "Meal Allowance",
    field: "mealAllowance",
    align: "right",
    sortable: true,
  },
  {
    name: "bonusTarget",
    label: "Bonus Target",
    field: "bonusTarget",
    align: "right",
    sortable: true,
  },
  {
    name: "totalSalary",
    label: "Total Salary",
    field: "totalSalary",
    align: "right",
    sortable: true,
  },
  {
    name: "openedAt",
    label: "Dibuka",
    field: "openedAt",
    align: "left",
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

const driverName = (r: SessionRow): string =>
  r.employee
    ? `${r.employee.firstName ?? ""} ${r.employee.lastName ?? ""}`.trim()
    : "—";

const shortWeekday = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", { weekday: "long" });
};

const buildParams = (): URLSearchParams => {
  const p = new URLSearchParams();
  // q-table emits a 1-based `page` (page 1 = first page), but our backend
  // uses 0-based pagination — so subtract 1 before sending. This matches
  // the convention used by the shared `usePagination` helper.
  const backendPage = Math.max(0, pagination.value.page - 1);
  p.set("page", String(backendPage));
  p.set("size", String(pagination.value.rowsPerPage));
  if (filters.from) p.set("from", filters.from);
  if (filters.to) p.set("to", filters.to);
  if (filters.status) p.set("status", filters.status);
  if (filters.employeeId) p.set("employeeId", filters.employeeId);
  const sortBy = pagination.value.sortBy;
  if (sortBy) {
    p.set("sortBy", sortBy);
    p.set("sortDir", pagination.value.descending ? "desc" : "asc");
  }
  return p;
};

const loadPage = async (): Promise<void> => {
  loading.value = true;
  try {
    const page = await store.fetchSessions(buildParams());
    rows.value = (page.contents ?? []).map((s: StockSessionDto) => ({
      id: s.id,
      date: s.date,
      employeeId: s.employeeId,
      employee: s.employee,
      status: s.status,
      openedAt: s.openedAt,
      closedAt: s.closedAt,
      totalItems: s.totalItems,
      totalSales: s.totalSales,
      // Map the salary breakdown fields from the DTO. Backend may
      // return null for OPEN sessions (no close-time resolution
      // yet); numOrZero-style coercion keeps the row strictly
      // numeric so the columns render without "—" everywhere.
      mealAllowance: s.mealAllowance ?? 0,
      attendance: s.attendance ?? 0,
      bonusTarget: s.bonusTarget ?? 0,
      totalSalary: s.totalSalary ?? 0,
      totalCommission: s.totalCommission ?? 0,
    }));
    rowsNumber.value = page.totalElements ?? rows.value.length;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    $q.notify({
      type: "negative",
      message: "Gagal memuat daftar sesi.",
      caption: message,
    });
  } finally {
    loading.value = false;
  }
};

const onRequest = async (props: {
  pagination: QTablePropsOnRequestPagination;
}): Promise<void> => {
  pagination.value = { ...pagination.value, ...props.pagination };
  await loadPage();
};

const applyFilters = async (): Promise<void> => {
  pagination.value.page = 1; // q-table is 1-based — first page == 1
  await loadPage();
};

const resetFilters = async (): Promise<void> => {
  filters.from = monthAgoIso;
  filters.to = todayIso;
  filters.status = null;
  filters.employeeId = null;
  await applyFilters();
};

const filterDrivers = (val: string, update: (fn: () => void) => void): void => {
  update(() => {
    void store.fetchDrivers(val).then((res) => {
      drivers.value = res;
    });
  });
};

// Re-load when from/to/status/employeeId change (debounced for dates)
let dateTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => [filters.from, filters.to] as const,
  () => {
    if (dateTimer) clearTimeout(dateTimer);
    dateTimer = setTimeout(() => {
      void applyFilters();
    }, 300);
  },
);

watch(
  () => [filters.status, filters.employeeId] as const,
  () => {
    void applyFilters();
  },
);

onMounted(async () => {
  drivers.value = await store.fetchDrivers();
  await loadPage();
});
</script>

<style scoped lang="scss">
.session-list-page {
  // leave room on mobile for the FAB
  padding-bottom: 80px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #9e9e9e;
}

.mobile-session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-session-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 14px;
}

@media (min-width: 600px) {
  .session-list-page {
    padding-bottom: 16px;
  }
}

@media (max-width: 599px) {
  // ensure chip + buttons don't break on narrow screens
  .mobile-session-card :deep(.q-chip) {
    max-width: 100%;
  }
}
</style>
