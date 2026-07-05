<template>
  <div>
    <!-- Header -->
    <q-card flat bordered class="q-mb-md bg-blue-1">
      <q-card-section class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-3">
          <q-input
            v-model="form.date"
            outlined
            dense
            label="Tanggal"
            mask="####-##-##"
            :rules="['date']"
            readonly
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="form.date" mask="YYYY-MM-DD" minimal />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-5">
          <q-select
            v-model="form.employeeId"
            :options="driverOptions"
            option-value="id"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
            label="Driver (Karyawan)"
            use-input
            input-debounce="300"
            @filter="filterDrivers"
            @update:model-value="onDriverChange"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey"
                  >Tidak ada driver</q-item-section
                >
              </q-item>
            </template>
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
        <div class="col-12 col-md-4 row justify-end">
          <q-chip
            color="blue-8"
            text-color="white"
            icon="wb_sunny"
            label="Morning Session"
            class="text-subtitle1"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Items Table -->
    <q-card flat bordered>
      <q-card-section class="row items-center q-py-sm">
        <div class="text-h6 text-blue-9">Produk yang Dibawa</div>
        <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Tambah Produk"
          no-caps
          unelevated
          @click="openPicker"
        />
      </q-card-section>
      <q-separator />
      <q-table
        :rows="form.items"
        :columns="itemColumns"
        row-key="itemId"
        flat
        dense
        :rows-per-page-options="[0]"
        hide-pagination
      >
        <template #body-cell-sellingPriceSnapshot="props">
          <q-td :props="props">
            <q-input
              v-model.number="props.row.sellingPriceSnapshot"
              type="number"
              dense
              outlined
              :disable="!!props.row.item"
              style="min-width: 120px"
              @update:model-value="recalc"
            />
          </q-td>
        </template>
        <template #body-cell-outQty="props">
          <q-td :props="props">
            <q-input
              v-model.number="props.row.outQty"
              type="number"
              dense
              outlined
              min="0"
              :rules="[
                (v: number) =>
                  (v >= 0 && Number.isInteger(v)) ||
                  'Harus bilangan bulat >= 0',
              ]"
              style="min-width: 110px"
              @update:model-value="recalc"
            />
          </q-td>
        </template>
        <template #body-cell-subtotal="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{ formatCurrency(props.row.subtotal) }}
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              icon="delete"
              color="negative"
              flat
              round
              dense
              @click="removeItem(props.rowIndex)"
            />
          </q-td>
        </template>
      </q-table>

      <q-separator />
      <q-card-section class="row items-center bg-grey-2">
        <div class="text-subtitle1">Total Estimasi</div>
        <q-space />
        <div class="text-h6 text-blue-9 text-weight-bold">
          {{ formatCurrency(totalSubtotal) }}
        </div>
      </q-card-section>
    </q-card>

    <ItemPickerDialog v-model="pickerOpen" @pick="onPickItem" />

    <q-card flat bordered class="q-mt-md">
      <q-card-actions align="right">
        <q-btn flat label="Reset" no-caps @click="reset" />
        <q-btn
          color="primary"
          unelevated
          icon="check"
          label="Buka Sesi"
          no-caps
          :disable="!canSubmit"
          :loading="submitting"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/require-await, @typescript-eslint/no-misused-promises */
import { computed, onMounted, reactive, ref } from "vue";
import { date, useQuasar } from "quasar";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import type {
  DriverDto,
  ItemDto,
  StockSessionItemInputDto,
} from "./types/stock-session";
import ItemPickerDialog from "./ItemPickerDialog.vue";

type FormItem = StockSessionItemInputDto & {
  sellingPriceSnapshot: number;
  subtotal: number;
};

const emit = defineEmits<{
  (e: "saved", id: string): void;
}>();

const $q = useQuasar();
const store = useStockSessionStore();

const form = reactive({
  employeeId: "",
  date: date.formatDate(new Date(), "YYYY-MM-DD"),
  items: [] as FormItem[],
});

const drivers = ref<DriverDto[]>([]);
const pickerOpen = ref(false);
const submitting = ref(false);

const itemColumns: any[] = [
  {
    name: "name",
    label: "Produk",
    field: (r: any) => r.item?.name ?? r.itemName ?? "-",
    align: "left" as const,
    sortable: false,
  },
  {
    name: "sku",
    label: "SKU",
    field: (r: any) => r.item?.sku ?? "-",
    align: "left" as const,
    sortable: false,
  },
  {
    name: "sellingPriceSnapshot",
    label: "Harga Jual",
    field: "sellingPriceSnapshot",
    align: "left" as const,
    sortable: false,
  },
  {
    name: "outQty",
    label: "Out Qty",
    field: "outQty",
    align: "left" as const,
    sortable: false,
  },
  {
    name: "subtotal",
    label: "Subtotal",
    field: "subtotal",
    align: "right" as const,
    sortable: false,
  },
  {
    name: "actions",
    label: "",
    field: "actions",
    align: "right" as const,
    sortable: false,
  },
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

const totalSubtotal = computed(() =>
  form.items.reduce((sum, it) => sum + (it.subtotal ?? 0), 0),
);

const canSubmit = computed(
  () =>
    !!form.employeeId &&
    !!form.date &&
    form.items.length > 0 &&
    form.items.every((it) => Number.isInteger(it.outQty) && it.outQty >= 0),
);

const filterDrivers = async (val: string, update: (fn: () => void) => void) => {
  update(async () => {
    drivers.value = await store.fetchDrivers(val);
  });
};

const onDriverChange = async () => {
  // If a session already exists for today, warn but allow override (save will fail).
  if (!form.employeeId) return;
  const existing = await store.getTodaySession(form.employeeId, form.date);
  if (existing) {
    $q.notify({
      type: "warning",
      message: `Driver ini sudah punya sesi pada ${form.date}.`,
      caption: existing.id,
    });
  }
};

const openPicker = () => {
  pickerOpen.value = true;
};

const onPickItem = (p: ItemDto) => {
  // Prevent duplicates
  if (form.items.some((it) => it.itemId === p.id)) {
    $q.notify({ type: "warning", message: "Produk sudah ada di daftar." });
    return;
  }
  form.items.push({
    itemId: p.id,
    item: p,
    outQty: 0,
    returnQty: 0,
    sellingPriceSnapshot: p.sellingPrice,
    subtotal: 0,
  });
};

const removeItem = (idx: number) => {
  form.items.splice(idx, 1);
};

const recalc = () => {
  for (const it of form.items) {
    const sold = Math.max(0, (it.outQty ?? 0) - (it.returnQty ?? 0));
    it.subtotal = sold * (it.sellingPriceSnapshot ?? 0);
  }
};

const reset = () => {
  form.employeeId = "";
  form.items = [];
};

const submit = async () => {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    const payload = {
      employeeId: form.employeeId,
      date: form.date,
      items: form.items.map((it) => ({
        itemId: it.itemId,
        outQty: it.outQty,
        returnQty: it.returnQty,
        item: it.item,
      })),
    };
    const result = await store.openSession(payload);
    $q.notify({
      type: "positive",
      message: "Sesi pagi berhasil dibuka.",
      caption: result.id,
    });
    emit("saved", result.id);
  } catch (err: any) {
    $q.notify({
      type: "negative",
      message: "Gagal membuka sesi.",
      caption: err?.message ?? String(err),
    });
  } finally {
    submitting.value = false;
  }
};

const formatCurrency = (n: number): string =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n ?? 0));

onMounted(async () => {
  drivers.value = await store.fetchDrivers();
});
</script>
