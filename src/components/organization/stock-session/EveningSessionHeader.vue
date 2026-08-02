<template>
  <q-card flat bordered class="q-mb-md" :class="statusClass">
    <q-card-section class="row q-col-gutter-md items-center">
      <div class="col-12 col-md-4">
        <div class="text-caption text-grey-7">Driver</div>
        <div class="text-h6 text-weight-bold">
          {{ driverName }}
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div class="text-caption text-grey-7">Tanggal</div>
        <div class="text-subtitle1">{{ session?.date }}</div>
      </div>
      <div class="col-6 col-md-2">
        <div class="text-caption text-grey-7">Status</div>
        <q-chip
          :color="session?.status === 'OPEN' ? 'orange' : 'green'"
          text-color="white"
          dense
          :icon="session?.status === 'OPEN' ? 'lock_open' : 'lock'"
          :label="session?.status"
          class="text-weight-bold"
        />
      </div>
      <div class="col-12 col-md-4 text-right">
        <q-chip color="indigo" text-color="white" icon="schedule">
          Dibuka: {{ formatTime(session?.openedAt) }}
        </q-chip>
        <q-chip
          v-if="session?.closedAt"
          color="green-8"
          text-color="white"
          icon="check_circle"
        >
          Ditutup: {{ formatTime(session.closedAt) }}
        </q-chip>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { StockSessionDto } from "./types/stock-session";
import { formatTime } from "./evening-form";

const props = defineProps<{
  session: StockSessionDto | null;
}>();

const isClosed = computed(() => props.session?.status === "CLOSED");

const statusClass = computed(() =>
  isClosed.value ? "bg-green-1" : "bg-orange-1",
);

const driverName = computed(() => {
  const e = props.session?.employee;
  if (!e) return "-";
  return `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || e.email || e.id;
});
</script>
