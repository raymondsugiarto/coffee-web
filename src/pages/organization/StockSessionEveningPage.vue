<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" :to="{ name: 'dashboard' }" />
      <div class="text-h5 text-weight-bold q-ml-sm">Tutup Sesi Sore</div>
    </div>
    <!-- Picker if no session loaded -->
    <q-card v-if="!session && !loading" flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Pilih Sesi untuk Ditutup</div>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-5">
            <q-select
              v-model="selectedEmployeeId"
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
              @filter="filterDrivers"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label
                      >{{ scope.opt.firstName }}
                      {{ scope.opt.lastName }}</q-item-label
                    >
                    <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="selectedDate"
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
                    <q-date v-model="selectedDate" mask="YYYY-MM-DD" minimal />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-btn
              unelevated
              color="primary"
              icon="search"
              label="Cari Sesi"
              no-caps
              :disable="!selectedEmployeeId"
              @click="loadSession"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
    <EveningForm v-if="session" :session="session" @closed="onClosed" />
  </q-page>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { date, useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import type {
  DriverDto,
  StockSessionDto,
} from "@/components/organization/stock-session/types/stock-session";
import EveningForm from "@/components/organization/stock-session/EveningForm.vue";
const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const store = useStockSessionStore();
const loading = ref(false);
const session = ref<StockSessionDto | null>(null);
const drivers = ref<DriverDto[]>([]);
const selectedEmployeeId = ref<string>("");
const selectedDate = ref<string>(date.formatDate(new Date(), "YYYY-MM-DD"));
const driverOptions = computed(() =>
  drivers.value.map((d) => ({
    id: d.id,
    label: `${d.firstName} ${d.lastName}`.trim() || d.email,
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email,
  })),
);
const filterDrivers = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    void store.fetchDrivers(val).then((res) => {
      drivers.value = res;
    });
  });
};
const loadSession = async () => {
  if (!selectedEmployeeId.value) return;
  loading.value = true;
  try {
    const s = await store.getTodaySession(
      selectedEmployeeId.value,
      selectedDate.value,
    );
    if (!s) {
      $q.notify({
        type: "warning",
        message: `Tidak ada sesi untuk driver ini pada ${selectedDate.value}.`,
      });
    }
    session.value = s;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    $q.notify({
      type: "negative",
      message: "Gagal memuat sesi.",
      caption: message,
    });
  } finally {
    loading.value = false;
  }
};
const onClosed = async (closedSession: StockSessionDto) => {
  // Refresh session state in case other consumers want it
  if (closedSession?.id) {
    try {
      session.value = await store.getSession(closedSession.id);
    } catch {
      session.value = closedSession;
    }
  }
  // Show success dialog and redirect to dashboard
  $q.dialog({
    title: "Sesi Berhasil Ditutup",
    message: `Sesi sore untuk ${
      closedSession?.employee
        ? `${closedSession.employee.firstName ?? ""} ${closedSession.employee.lastName ?? ""}`.trim()
        : "driver"
    } telah berhasil disimpan.`,
    ok: {
      label: "Ke Dashboard",
      color: "primary",
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    void router.push({ name: "dashboard" });
  });

  setTimeout(() => {
    void router.push({ name: "dashboard" });
  }, 2500);
};
onMounted(async () => {
  drivers.value = await store.fetchDrivers();
  const sessionId = route.query.sessionId as string | undefined;
  if (sessionId) {
    loading.value = true;
    try {
      session.value = await store.getSession(sessionId);
    } catch {
      session.value = null;
    } finally {
      loading.value = false;
    }
  }
});
</script>
