<template>
  <div>
    <!-- Session Header -->
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

    <!-- Items Table -->
    <q-card flat bordered>
      <q-card-section class="row items-center q-py-sm bg-orange-1">
        <div class="text-h6 text-orange-9">Stok & Penjualan</div>
        <q-space />
        <q-chip color="orange-9" text-color="white" dense>
          {{ totalItems }} item terjual
        </q-chip>
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
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.item?.name }}</div>
            <div class="text-caption text-grey-7">
              {{ props.row.item?.sku }}
            </div>
          </q-td>
        </template>
        <template #body-cell-outQty="props">
          <q-td :props="props" class="text-right">
            <q-badge color="blue-8">{{ props.row.outQty }}</q-badge>
          </q-td>
        </template>
        <template #body-cell-returnQty="props">
          <q-td :props="props">
            <q-input
              v-model.number="props.row.returnQty"
              type="number"
              dense
              outlined
              :disable="isClosed"
              :max="props.row.outQty"
              min="0"
              style="min-width: 100px"
              :rules="[
                (v: number) =>
                  (v >= 0 && Number.isInteger(v)) || 'Harus bilangan bulat',
                (v: number) =>
                  v <= props.row.outQty || 'Return tidak boleh melebihi Out',
              ]"
              @update:model-value="recalc"
            />
          </q-td>
        </template>
        <template #body-cell-soldQty="props">
          <q-td :props="props" class="text-right text-weight-bold text-green-9">
            {{ props.row.soldQty }}
          </q-td>
        </template>
        <template #body-cell-sellingPriceSnapshot="props">
          <q-td :props="props" class="text-right">
            {{ formatCurrency(props.row.sellingPriceSnapshot) }}
          </q-td>
        </template>
        <template #body-cell-subtotal="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{ formatCurrency(props.row.subtotal) }}
          </q-td>
        </template>
      </q-table>

      <q-separator />
      <q-card-section class="row items-center bg-grey-2">
        <div class="text-subtitle1 text-weight-medium">Total Sales</div>
        <q-space />
        <div class="text-h5 text-weight-bold text-orange-9">
          {{ formatCurrency(totals.totalSales) }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Payments + Adjustments -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section class="row items-center q-py-sm bg-green-1">
            <div class="text-h6 text-green-9">Pembayaran</div>
            <q-space />
            <q-btn
              v-if="!isClosed"
              color="green-8"
              icon="add"
              label="Tambah"
              no-caps
              dense
              unelevated
              @click="addPayment"
            />
          </q-card-section>
          <q-separator />
          <q-table
            :rows="form.payments"
            :columns="paymentColumns"
            row-key="paymentMethod"
            flat
            dense
            :rows-per-page-options="[0]"
            hide-pagination
          >
            <template #body-cell-paymentMethod="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.paymentMethod"
                  :options="paymentMethods"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  :disable="isClosed"
                  style="min-width: 130px"
                />
              </q-td>
            </template>
            <template #body-cell-amount="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.amount"
                  type="number"
                  outlined
                  dense
                  :disable="isClosed"
                  min="0"
                  style="min-width: 160px"
                  @update:model-value="recalc"
                />
              </q-td>
            </template>
            <template #body-cell-notes="props">
              <q-td :props="props">
                <q-input
                  v-model="props.row.notes"
                  dense
                  outlined
                  :disable="isClosed"
                  placeholder="Catatan (opsional)"
                />
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props" class="text-right">
                <q-btn
                  v-if="!isClosed"
                  icon="delete"
                  color="negative"
                  flat
                  round
                  dense
                  @click="removePayment(props.rowIndex)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section class="row items-center q-py-sm bg-red-1">
            <div class="text-h6 text-red-9">Penyesuaian Kas (Opsional)</div>
            <q-space />
            <q-btn
              v-if="!isClosed"
              color="red-8"
              icon="add"
              label="Tambah"
              no-caps
              dense
              unelevated
              @click="addAdjustment"
            />
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="(a, idx) in form.adjustments" :key="idx">
              <q-item-section>
                <q-select
                  v-model="a.type"
                  :options="adjustmentTypes"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  :disable="isClosed"
                  label="Tipe"
                />
              </q-item-section>
              <q-item-section>
                <q-input
                  v-model.number="a.amount"
                  type="number"
                  outlined
                  dense
                  :disable="isClosed"
                  min="0"
                  label="Nominal"
                />
              </q-item-section>
              <q-item-section>
                <q-input
                  v-model="a.reason"
                  outlined
                  dense
                  :disable="isClosed"
                  label="Alasan"
                />
              </q-item-section>
              <q-item-section side v-if="!isClosed">
                <q-btn
                  icon="delete"
                  color="negative"
                  flat
                  round
                  dense
                  @click="form.adjustments.splice(idx, 1)"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="!form.adjustments.length">
              <q-item-section class="text-grey">
                Tidak ada penyesuaian.
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <!-- Summary Footer -->
    <q-card flat bordered class="q-mt-md bg-grey-2">
      <q-card-section>
        <div class="row q-col-gutter-md text-center">
          <div class="col">
            <div class="text-caption text-grey-7">Total Sales</div>
            <div class="text-h6 text-weight-bold text-orange-9">
              {{ formatCurrency(totals.totalSales) }}
            </div>
          </div>
          <div class="col">
            <div class="text-caption text-grey-7">Cash</div>
            <div class="text-h6 text-weight-bold">
              {{ formatCurrency(totals.totalCash) }}
            </div>
          </div>
          <div class="col">
            <div class="text-caption text-grey-7">QRIS</div>
            <div class="text-h6 text-weight-bold">
              {{ formatCurrency(totals.totalQris) }}
            </div>
          </div>
          <div class="col">
            <div class="text-caption text-grey-7">Other</div>
            <div class="text-h6 text-weight-bold">
              {{ formatCurrency(totals.totalOther) }}
            </div>
          </div>
          <div class="col">
            <div class="text-caption text-grey-7">Total Payment</div>
            <div class="text-h6 text-weight-bold text-green-9">
              {{ formatCurrency(totals.totalPayment) }}
            </div>
          </div>
          <div class="col">
            <div class="text-caption text-grey-7">Difference</div>
            <div class="text-h6 text-weight-bold" :class="differenceClass">
              {{ formatCurrency(totals.difference) }}
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-input
          v-model="form.notes"
          type="textarea"
          outlined
          autogrow
          label="Catatan (opsional)"
          :disable="isClosed"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-if="!isClosed"
          color="green-8"
          icon="check_circle"
          label="Tutup Sesi"
          no-caps
          unelevated
          :loading="submitting"
          :disable="!canClose"
          @click="closeSession"
        />
        <q-chip
          v-else
          color="green-9"
          text-color="white"
          icon="verified"
          label="Closed"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, reactive, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import type {
  CashAdjustmentInputDto,
  PaymentDetailInputDto,
  StockSessionDto,
  StockSessionItemDto,
  StockSessionItemInputDto,
} from "./types/stock-session";

const props = defineProps<{
  session: StockSessionDto | null;
}>();

const emit = defineEmits<{
  (e: "closed"): void;
}>();

const $q = useQuasar();
const store = useStockSessionStore();
const submitting = ref(false);

const form = reactive({
  items: [] as Array<
    StockSessionItemInputDto & {
      soldQty: number;
      subtotal: number;
      sellingPriceSnapshot: number;
    }
  >,
  payments: [] as PaymentDetailInputDto[],
  adjustments: [] as CashAdjustmentInputDto[],
  notes: "",
});

const paymentMethods = [
  { value: "CASH", label: "CASH" },
  { value: "QRIS", label: "QRIS" },
  { value: "TRANSFER", label: "TRANSFER" },
  { value: "OTHER", label: "OTHER" },
];

const adjustmentTypes = [
  { value: "SHORTAGE", label: "SHORTAGE" },
  { value: "OVERAGE", label: "OVERAGE" },
];

const itemColumns: any[] = [
  {
    name: "name",
    label: "Produk",
    field: "itemId",
    align: "left" as const,
    sortable: false,
  },
  {
    name: "outQty",
    label: "Pagi (Out)",
    field: "outQty",
    align: "right" as const,
    sortable: false,
  },
  {
    name: "returnQty",
    label: "Kembali",
    field: "returnQty",
    align: "right" as const,
    sortable: false,
  },
  {
    name: "soldQty",
    label: "Terjual",
    field: "soldQty",
    align: "right" as const,
    sortable: false,
  },
  {
    name: "sellingPriceSnapshot",
    label: "Harga",
    field: "sellingPriceSnapshot",
    align: "right" as const,
    sortable: false,
  },
  {
    name: "subtotal",
    label: "Subtotal",
    field: "subtotal",
    align: "right" as const,
    sortable: false,
  },
];

const paymentColumns: any[] = [
  {
    name: "paymentMethod",
    label: "Metode",
    field: "paymentMethod",
    align: "left" as const,
    sortable: false,
  },
  {
    name: "amount",
    label: "Nominal",
    field: "amount",
    align: "left" as const,
    sortable: false,
  },
  {
    name: "notes",
    label: "Catatan",
    field: "notes",
    align: "left" as const,
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

const isClosed = computed(() => props.session?.status === "CLOSED");
const statusClass = computed(() =>
  isClosed.value ? "bg-green-1" : "bg-orange-1",
);

const driverName = computed(() => {
  const e = props.session?.employee;
  if (!e) return "-";
  return `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || e.email || e.id;
});

const totalItems = computed(() =>
  form.items.reduce((s, it) => s + (it.soldQty ?? 0), 0),
);

const totals = computed(() => {
  const totalSales = form.items.reduce((s, it) => s + (it.subtotal ?? 0), 0);
  let cash = 0,
    qris = 0,
    other = 0,
    totalPayment = 0;
  for (const p of form.payments) {
    totalPayment += Number(p.amount ?? 0);
    if (p.paymentMethod === "CASH") cash += Number(p.amount ?? 0);
    else if (p.paymentMethod === "QRIS") qris += Number(p.amount ?? 0);
    else if (p.paymentMethod === "TRANSFER" || p.paymentMethod === "OTHER")
      other += Number(p.amount ?? 0);
  }
  return {
    totalSales,
    totalCash: cash,
    totalQris: qris,
    totalOther: other,
    totalPayment,
    difference: totalPayment - totalSales,
  };
});

const differenceClass = computed(() =>
  Math.abs(totals.value.difference) < 0.01
    ? "text-grey-7"
    : totals.value.difference < 0
      ? "text-red-9"
      : "text-green-9",
);

const canClose = computed(
  () =>
    !isClosed.value &&
    form.items.length > 0 &&
    form.items.every(
      (it) =>
        Number.isInteger(it.returnQty) &&
        it.returnQty >= 0 &&
        it.returnQty <= it.outQty,
    ) &&
    form.payments.length > 0 &&
    form.payments.every(
      (p) =>
        Number.isFinite(p.amount) &&
        p.amount >= 0 &&
        (p.paymentMethod === "CASH" ||
          p.paymentMethod === "QRIS" ||
          p.paymentMethod === "TRANSFER" ||
          p.paymentMethod === "OTHER"),
    ),
);

watch(
  () => props.session,
  (s) => {
    if (!s) return;
    form.items = (s.items ?? []).map((it: StockSessionItemDto) => ({
      itemId: it.itemId,
      item: it.item,
      outQty: it.outQty,
      returnQty: it.returnQty,
      sellingPriceSnapshot: it.sellingPriceSnapshot,
      soldQty: it.soldQty,
      subtotal: it.subtotal,
    }));
    form.payments = (s.payments ?? []).map((p) => ({
      paymentMethod: p.paymentMethod,
      amount: p.amount,
      referenceNumber: p.referenceNumber,
      notes: p.notes,
    }));
    form.adjustments = (s.adjustments ?? []).map((a) => ({
      type: a.type,
      amount: a.amount,
      reason: a.reason,
    }));
    form.notes = s.notes ?? "";
  },
  { immediate: true, deep: true },
);

const recalc = () => {
  for (const it of form.items) {
    const sold = Math.max(0, (it.outQty ?? 0) - (it.returnQty ?? 0));
    it.soldQty = sold;
    it.subtotal = sold * (it.sellingPriceSnapshot ?? 0);
  }
};

const addPayment = () => {
  form.payments.push({ paymentMethod: "CASH", amount: 0 });
};

const removePayment = (idx: number) => {
  form.payments.splice(idx, 1);
  recalc();
};

const addAdjustment = () => {
  form.adjustments.push({ type: "SHORTAGE", amount: 0 });
};

const closeSession = async () => {
  if (!props.session || isClosed.value) return;
  submitting.value = true;
  try {
    recalc();
    await store.closeSession(props.session.id, {
      items: form.items.map((it) => ({
        itemId: it.itemId,
        outQty: it.outQty,
        returnQty: it.returnQty,
      })),
      payments: form.payments,
      adjustments: form.adjustments,
      notes: form.notes,
    });
    $q.notify({
      type: "positive",
      message: "Sesi berhasil ditutup.",
    });
    emit("closed");
  } catch (err: any) {
    $q.notify({
      type: "negative",
      message: "Gagal menutup sesi.",
      caption: err?.message ?? String(err),
    });
  } finally {
    submitting.value = false;
  }
};

const formatCurrency = (n: number): string =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n ?? 0));

const formatTime = (iso?: string): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", { hour12: false });
};
</script>
