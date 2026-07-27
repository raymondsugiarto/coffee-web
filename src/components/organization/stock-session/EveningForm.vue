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
        <q-chip
          v-if="isLoadingChildren"
          color="blue-8"
          text-color="white"
          dense
          icon="cloud_download"
        >
          Memuat varian…
        </q-chip>
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
            <div
              v-if="parentNameFor(props.row)"
              class="text-caption text-grey-7"
            >
              <q-icon name="account_tree" size="14px" class="q-mr-xs" />
              Induk: {{ parentNameFor(props.row) }}
            </div>
          </q-td>
        </template>
        <template #body-cell-outQty="props">
          <q-td :props="props" class="text-right">
            <q-badge v-if="!isChildRow(props.row)" color="blue-8">{{
              props.row.outQty
            }}</q-badge>
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>
        <template #body-cell-returnQty="props">
          <q-td :props="props">
            <!--
              Kembali input is only rendered on the parent row. The
              parent.returnQty is the single source of truth for the
              pool: any unsold variant goes back into the parent's
              return. Child rows show a "–" because their returnQty is
              always 0 in this flow.
            -->
            <template v-if="isParentRow(props.row)">
              <q-input
                v-model.number="props.row.returnQty"
                type="number"
                dense
                outlined
                :disable="isClosed"
                :max="props.row.outQty"
                :min="0"
                input-class="text-right"
                :class="{ 'qty-invalid': isParentReturnInvalid(props.row) }"
                style="min-width: 100px"
              />
            </template>
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>
        <template #body-cell-soldQty="props">
          <q-td :props="props">
            <!--
              Per-row Terjual is now a derived sum of two captures:
              Terjual (Cash) + Terjual (QRIS). The rolled `soldQty`
              lives on the row as a getter (computed from the two
              inputs) so subtotal / pool-remaining / invalid-flag
              all read the right number without a manual sync.
            -->
            <div class="row q-col-gutter-xs items-center">
              <q-input
                v-model.number="props.row.cashSoldQty"
                type="number"
                dense
                outlined
                :disable="isClosed"
                :min="0"
                label="Cash"
                stack-label
                input-class="text-right"
                style="min-width: 86px"
                @update:model-value="onSoldSplitChanged(props.row)"
              />
              <q-icon name="add" size="14px" color="grey-6" />
              <q-input
                v-model.number="props.row.cashlessSoldQty"
                type="number"
                dense
                outlined
                :disable="isClosed"
                :min="0"
                label="QRIS"
                stack-label
                input-class="text-right"
                style="min-width: 86px"
                @update:model-value="onSoldSplitChanged(props.row)"
              />
            </div>
            <div
              v-if="isSoldInvalid(props.row)"
              class="text-caption text-negative q-mt-xs"
            >
              Total ({{ props.row.soldQty }}) + kembali melebihi pool ({{
                outQtyForRow(props.row)
              }})
            </div>
          </q-td>
        </template>
        <template #body-cell-poolRemaining="props">
          <q-td :props="props" class="text-right">
            <!--
              Sisa Pool is shown only on parent rows of a group, and on
              orphan / single items (no parent). All rows within a
              group share the same remaining capacity, so duplicating
              the value on every child row would be noise.
            -->
            <template v-if="!isChildRow(props.row)">
              <q-badge
                :color="poolRemainingForRow(props.row) < 0 ? 'red-9' : 'grey-7'"
                text-color="white"
              >
                {{ poolRemainingForRow(props.row) }}
              </q-badge>
            </template>
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>
        <template #body-cell-sellingPriceSnapshot="props">
          <q-td :props="props" class="text-right">
            {{ formatCurrency(props.row.sellingPriceSnapshot) }}
          </q-td>
        </template>
        <template #body-cell-subtotal="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{
              formatCurrency(props.row.soldQty * props.row.sellingPriceSnapshot)
            }}
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
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useQuasar } from "quasar";
import type { QTableColumn } from "quasar";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import { formatCurrency } from "@/composables/format";
import type {
  CashAdjustmentInputDto,
  ItemDto,
  PaymentDetailInputDto,
  StockSessionDto,
  StockSessionItemDto,
  StockSessionItemInputDto,
} from "./types/stock-session";
const props = defineProps<{
  session: StockSessionDto | null;
}>();
const emit = defineEmits<{
  (e: "closed", session: StockSessionDto): void;
}>();
const $q = useQuasar();

/**
 * Coerces a backend-returned amount (`number | null | undefined | ""`)
 * to a safe finite `number`. q-input with v-model.number emits `""`
 * for empty inputs, which Go then refuses to unmarshal into float64.
 * Use this at any boundary between the API and the JSON body we send.
 */
const numOrZero = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const store = useStockSessionStore();
const submitting = ref(false);
const isLoadingChildren = ref(false);
const form = reactive({
  // `outQty` is optional on the wire DTO (the close path doesn't
  // send it), but the form always keeps it populated from the
  // session load so the UI can read it without `?` chains.
  items: [] as Array<
    StockSessionItemInputDto & {
      outQty: number;
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
interface ItemRow {
  itemId: string;
  item?: {
    name?: string;
    sku?: string;
    parentId?: string;
    parent?: { name?: string } | undefined;
  };
  outQty: number;
  returnQty: number;
  // `soldQty` is the rolled-up total (= cashSoldQty +
  // cashlessSoldQty). The form keeps a denormalised copy so the
  // subtotal cell and the poolRemaining helpers keep reading a
  // single int instead of recomputing `cash + cashless` on every
  // access. `onSoldSplitChanged` is the single point that
  // refreshes this field whenever one of the two splits changes.
  soldQty: number;
  cashSoldQty: number;
  cashlessSoldQty: number;
  sellingPriceSnapshot: number;
  subtotal: number;
}

interface PaymentRow {
  paymentMethod: PaymentDetailInputDto["paymentMethod"];
  amount: number;
  notes?: string;
}

const itemColumns: QTableColumn<ItemRow>[] = [
  {
    name: "name",
    label: "Produk",
    field: (r) => r.item?.name ?? "-",
    align: "left",
    sortable: false,
  },
  {
    name: "outQty",
    label: "Pagi (Out)",
    field: "outQty",
    align: "right",
    sortable: false,
  },
  {
    name: "returnQty",
    label: "Kembali",
    field: "returnQty",
    align: "right",
    sortable: false,
  },
  {
    name: "soldQty",
    label: "Terjual",
    field: (r: ItemRow) => Math.max(0, Number(r.soldQty) || 0),
    align: "right",
    sortable: false,
  },
  {
    name: "poolRemaining",
    label: "Sisa Pool",
    // `r` is typed as the narrow `ItemRow` here (the column shape).
    // The real q-table row is the broader `form.items[i]`, which
    // carries `item.parent?.id` etc. — cast so the helper can read it.
    field: (r: ItemRow) =>
      poolRemainingForRow(r as (typeof form.items)[number]),
    align: "right",
    sortable: false,
  },
  {
    name: "sellingPriceSnapshot",
    label: "Harga",
    field: "sellingPriceSnapshot",
    align: "right",
    sortable: false,
  },
  {
    name: "subtotal",
    label: "Subtotal",
    field: "subtotal",
    align: "right",
    sortable: false,
  },
];
const paymentColumns: QTableColumn<PaymentRow>[] = [
  {
    name: "paymentMethod",
    label: "Metode",
    field: "paymentMethod",
    align: "left",
    sortable: false,
  },
  {
    name: "amount",
    label: "Nominal",
    field: "amount",
    align: "left",
    sortable: false,
  },
  {
    name: "notes",
    label: "Catatan",
    field: "notes",
    align: "left",
    sortable: false,
  },
  {
    name: "actions",
    label: "",
    field: () => "",
    align: "right",
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
    // Per-row inputs valid (no negatives, no over-self out).
    form.items.every((it) => !isReturnInvalid(it) && !isSoldInvalid(it)) &&
    // Group constraint: parent.return + Σ group rows' soldQty ≤ parent.outQty.
    parentGroups.value.every((g) => !parentGroupOverflowFor(g)) &&
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

/** Group-level invalid: parent.return + Σ group rows' soldQty ≠ parent.outQty
 * with the difference overfilling the pool. Used by `canClose`. */
const parentGroupOverflowFor = (g: ParentGroup): boolean => {
  const parentRow = form.items.find(
    (r) => (r.item?.id ?? r.itemId) === g.parentId,
  );
  if (!parentRow) return true;
  const parentReturn = Math.max(0, Number(parentRow.returnQty) || 0);
  const totalSold = form.items.reduce((sum, it) => {
    const isMember =
      g.memberIds.has(it.itemId) || (it.item?.id ?? it.itemId) === g.parentId;
    return isMember ? sum + Math.max(0, Number(it.soldQty) || 0) : sum;
  }, 0);
  return parentReturn + totalSold > g.parentOutQty;
};
watch(
  () => props.session,
  async (s) => {
    if (!s) return;
    form.items = (s.items ?? []).map((it: StockSessionItemDto) => {
      // Cash / Cashless split is the new per-row input. Historical
      // rows persisted before the migration only have soldQty; we
      // assign it all to cash so the rolled subtotal stays correct
      // when re-edited.
      const cashSplit = numOrZero(it.cashSoldQty);
      const cashlessSplit = numOrZero(it.cashlessSoldQty);
      const rolledSold = numOrZero(it.soldQty);
      const splitSum = cashSplit + cashlessSplit;
      const cash = splitSum > 0 ? cashSplit : rolledSold;
      const cashless = splitSum > 0 ? cashlessSplit : 0;
      return {
        itemId: it.itemId,
        item: it.item,
        // outQty is required on the persisted row (computed as
        // soldQty + returnQty at close) but optional on the wire DTO
        // — coerce so the form's local type stays number.
        outQty: numOrZero(it.outQty),
        returnQty: numOrZero(it.returnQty),
        sellingPriceSnapshot: it.sellingPriceSnapshot,
        cashSoldQty: cash,
        cashlessSoldQty: cashless,
        // `soldQty` stays the rolled view so subtotal / totalItems /
        // pool helpers keep reading a single int.
        soldQty: cash + cashless,
        subtotal: it.subtotal,
      };
    });
    form.payments = (s.payments ?? []).map((p) => ({
      paymentMethod: p.paymentMethod,
      // Backend may return `null` for empty payment rows. q-input with
      // v-model.number coerces `null` into `""`, which Go then refuses
      // to unmarshal into float64. Force a numeric default here.
      amount: numOrZero(p.amount),
      referenceNumber: p.referenceNumber,
      notes: p.notes,
    }));
    form.adjustments = (s.adjustments ?? []).map((a) => ({
      type: a.type,
      // Same `null` → `""` coercion issue as payments above; keep this
      // a number from the moment it enters the form.
      amount: numOrZero(a.amount),
      reason: a.reason,
    }));
    form.notes = s.notes ?? "";

    // Auto-expand: for each item the driver took this morning, pull its
    // child variants from /products/children so admin can qty them at
    // close time even if the driver decides to sell a variant.
    await loadChildrenForCurrentItems();
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  // Backup path: if the watcher fired before props.session had items,
  // call again now that the component is fully mounted.
  if (
    props.session?.items?.length &&
    form.items.length === props.session.items.length
  ) {
    await loadChildrenForCurrentItems();
  }

  // Pre-warm the catalog cache so parent-name lookups don't fall back
  // to raw UUIDs on the first render. `store.items` is the same list
  // used by the picker dialog; safe to call repeatedly.
  try {
    await store.fetchItems();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.debug("catalog warm-up failed (non-fatal):", message);
  }
});

/**
 * Fetch child variants for each opened item and interleave them
 * directly under their parent in `form.items`. Idempotent — re-running
 * on the same session is a no-op.
 *
 * NOTE: declared with `function` (not `const`) so the symbol is hoisted.
 * The watcher above uses `{ immediate: true }` and synchronously calls
 * this function during setup; a `const` arrow would land in the TDZ.
 */
async function loadChildrenForCurrentItems(): Promise<void> {
  const parentIds = form.items
    .map((it) => it.item?.id ?? it.itemId)
    .filter((id): id is string => !!id);
  console.debug("[stock-session/evening] auto-expand children", {
    parentIds,
    itemCount: form.items.length,
  });
  if (parentIds.length === 0) return;

  isLoadingChildren.value = true;
  try {
    const children = await store.fetchItemChildren(parentIds);
    console.debug("[stock-session/evening] children fetched", {
      count: children?.length,
      sample: children?.[0],
    });
    if (!children || children.length === 0) return;

    // Group incoming children by their parent_id so each variant can
    // be slotted in immediately after its parent in `form.items`.
    // Children that arrive without a parent_id (data drift) are
    // collected separately and appended at the very end so we never
    // lose them.
    const existingIds = new Set(form.items.map((it) => it.itemId));
    const byParent = new Map<string, ItemDto[]>();
    const orphans: ItemDto[] = [];
    for (const c of children) {
      if (existingIds.has(c.id)) continue;
      if (c.parentId && byParent.has(c.parentId)) {
        byParent.get(c.parentId)?.push(c);
      } else if (c.parentId) {
        byParent.set(c.parentId, [c]);
      } else {
        orphans.push(c);
      }
    }

    // Walk `form.items` from bottom to top so the splice indices we
    // capture remain valid as we insert children beneath their
    // parents. Sorting the children within each parent group by name
    // keeps the table visually ordered.
    for (const list of byParent.values()) {
      list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    }
    const newRows: Array<
      StockSessionItemInputDto & {
        soldQty: number;
        subtotal: number;
        sellingPriceSnapshot: number;
      }
    > = [];
    for (let i = form.items.length - 1; i >= 0; i--) {
      const parent = form.items[i];
      if (!parent) continue;
      const pid = parent.item?.id ?? parent.itemId;
      const kids = byParent.get(pid);
      if (!kids || kids.length === 0) continue;
      // Insert kids in name-sorted order directly after `parent`.
      // Use splice to keep the reactive array consistent.
      const toInsert = kids.map((c) => ({
        itemId: c.id,
        item: c,
        outQty: 0,
        returnQty: 0,
        sellingPriceSnapshot: c.sellingPrice,
        cashSoldQty: 0,
        cashlessSoldQty: 0,
        soldQty: 0,
        subtotal: 0,
      }));
      form.items.splice(i + 1, 0, ...toInsert);
      newRows.push(...toInsert);
    }

    // Anything that arrived without a recognizable parentId falls
    // through to the bottom of the table — better than dropping.
    if (orphans.length > 0) {
      for (const c of orphans) {
        const row = {
          itemId: c.id,
          item: c,
          outQty: 0,
          returnQty: 0,
          sellingPriceSnapshot: c.sellingPrice,
          cashSoldQty: 0,
          cashlessSoldQty: 0,
          soldQty: 0,
          subtotal: 0,
        };
        form.items.push(row);
        newRows.push(row);
      }
    }

    if (newRows.length > 0) {
      console.debug("[stock-session/evening] interleaved children", {
        count: newRows.length,
        parentGroups: byParent.size,
        orphans: orphans.length,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    $q.notify({
      type: "warning",
      message: "Gagal memuat varian produk.",
      caption: message,
    });
  } finally {
    isLoadingChildren.value = false;
  }
}

/**
 * Is `row` the parent in a group (or an orphan row that never
 * belonged to a shared pool)? Determines whether the Kembali input
 * is shown.
 */
const isParentRow = (row: (typeof form.items)[number]): boolean => {
  const ownId = row.item?.id ?? row.itemId;
  const parentId = row.item?.parent?.id || row.item?.parentId || "";
  // Either no parent declared, or it's the parent itself.
  return !parentId || parentId === ownId;
};

const isParentReturnInvalid = (row: (typeof form.items)[number]): boolean => {
  const v = Number(row.returnQty);
  if (Number.isNaN(v) || v < 0 || !Number.isInteger(v)) return true;
  return v > (row.outQty ?? 0);
};

const isSoldInvalid = (row: (typeof form.items)[number]): boolean => {
  const v = Number(row.soldQty);
  if (Number.isNaN(v) || v < 0 || !Number.isInteger(v)) return true;
  const g = groupOf(row);
  if (!g) return false; // orphan rows: only negative check above applies
  const remaining = remainingForRow(g, row);
  return v > remaining;
};

/**
 * The remaining pool units that `row` is allowed to claim as terjual.
 * = parent.outQty − parent's returnQty − Σ(other rows' terjual in group).
 */
const remainingForRow = (
  g: ParentGroup,
  row: (typeof form.items)[number],
): number => {
  const parentRow = form.items.find(
    (r) => (r.item?.id ?? r.itemId) === g.parentId,
  );
  if (!parentRow) return 0;
  const parentReturn = Math.max(0, Number(parentRow.returnQty) || 0);
  const othersSold = form.items.reduce((sum, it) => {
    if (it.itemId === row.itemId) return sum;
    const isMember =
      g.memberIds.has(it.itemId) || (it.item?.id ?? it.itemId) === g.parentId;
    return isMember ? sum + Math.max(0, Number(it.soldQty) || 0) : sum;
  }, 0);
  return Math.max(0, g.parentOutQty - parentReturn - othersSold);
};

/**
 * Is this row a child variant (parent loaded in session)?
 * Used to hide the "Pagi (Out)" cell for child rows.
 */
const isChildRow = (row: (typeof form.items)[number]): boolean => {
  const ownId = row.item?.id ?? row.itemId;
  const parentId = row.item?.parent?.id || row.item?.parentId || "";
  return !!parentId && parentId !== ownId;
};

/**
 * Recompute the rolled `soldQty` (cash + cashless) and `subtotal`
 * for a row whose split inputs just changed. We keep both on the
 * row object so downstream readers (subtotal cell, totalItems
 * computed, poolRemaining helpers, canClose) all see the new
 * value without fanning out a getter call site by call site.
 */
const onSoldSplitChanged = (row: (typeof form.items)[number]): void => {
  const cash = Math.max(0, Number(row.cashSoldQty) || 0);
  const cashless = Math.max(0, Number(row.cashlessSoldQty) || 0);
  row.cashSoldQty = cash;
  row.cashlessSoldQty = cashless;
  row.soldQty = cash + cashless;
  row.subtotal = row.soldQty * (Number(row.sellingPriceSnapshot) || 0);
};

/**
 * Effective outQty of a row used by the inline invalid hint (over-
 * the-pool). Reads directly from the row so the message updates
 * without depending on the watcher ticking first.
 */
const outQtyForRow = (row: (typeof form.items)[number]): number =>
  Math.max(0, Number(row.outQty) || 0);

/**
 * Resolve a child row's parent product name, preferring richer sources
 * in order:
 *   1. The child row's nested `item.parent.name` (if backend returned it).
 *   2. The parent row's `item.name` already loaded into this same
 *      session's `form.items`.
 *   3. A lookup against the catalog cached in `store.items`.
 *   4. The raw `parentId` UUID — only as a last-resort fallback.
 *
 * Returns `null` when there's no parent at all (orphan rows) so the
 * template can hide the "Induk:" line entirely.
 */
const parentNameFor = (row: (typeof form.items)[number]): string | null => {
  const parentId = row.item?.parent?.id || row.item?.parentId || "";
  if (!parentId) return null;

  // 1. Nested parent object from backend.
  const nested = row.item?.parent?.name;
  if (nested) return nested;

  // 2. Parent row already loaded in this session.
  const inForm = form.items.find((r) => (r.item?.id ?? r.itemId) === parentId);
  if (inForm?.item?.name) return inForm.item.name;

  // 3. Cached catalog.
  const cached = store.items.find((p) => p.id === parentId);
  if (cached?.name) return cached.name;

  // 4. Last resort — raw UUID.
  return parentId;
};

// ===== Parent-aware validation =====
//
// When a row has a parent loaded in the morning session, the shared
// inventory is the parent's `outQty`. The parent's own return plus the
// returns of every child variant cannot exceed that shared cap.
//
// In code: "return capacity" = parent's outQty − sum(other rows'
// returnQty). The current row may only consume what's left.
//
// Rows without a parent share (children that reference a parent that's
// not in this session, or vendor-added items) fall back to the local
// `outQty`-based rule.

interface ParentGroup {
  parentId: string;
  parentOutQty: number;
  memberIds: Set<string>;
}

const parentGroups = computed<ParentGroup[]>(() => {
  const groups = new Map<string, ParentGroup>();
  const parentOutFor = (id: string): number => {
    const pr = form.items.find((r) => (r.item?.id ?? r.itemId) === id);
    return pr?.outQty ?? 0;
  };
  for (const it of form.items) {
    const ownId = it.item?.id ?? it.itemId;
    const parentId = it.item?.parent?.id || it.item?.parentId || "";
    if (!parentId || parentId === ownId) continue;
    let g = groups.get(parentId);
    if (!g) {
      g = {
        parentId,
        parentOutQty: parentOutFor(parentId),
        memberIds: new Set<string>(),
      };
      groups.set(parentId, g);
    }
    g.memberIds.add(it.itemId);
    g.parentOutQty = parentOutFor(parentId);
  }
  return Array.from(groups.values());
});

const groupOf = (row: (typeof form.items)[number]): ParentGroup | undefined => {
  const ownId = row.itemId;
  const parentId = row.item?.parent?.id || row.item?.parentId || "";
  if (parentId && parentId !== ownId)
    return parentGroups.value.find((g) => g.parentId === parentId);
  // Bare rows whose parent *is in the session* belong to the parent's group too.
  const ownIdAsParent = row.item?.id ?? row.itemId;
  return parentGroups.value.find((g) => g.parentId === ownIdAsParent);
};

/**
 * Maximum returnQty allowed for a parent row. Children never receive a
 * Kembali input (returnQty is only meaningful on the parent for a
 * shared pool), so this caps the parent's input at its own outQty.
 */
const maxReturnForRow = (row: (typeof form.items)[number]): number =>
  Math.max(0, row.outQty ?? 0);

/**
 * Per-row returnQty validity check (only ever called for parent rows).
 */
const isReturnInvalid = (row: (typeof form.items)[number]): boolean => {
  const v = Number(row.returnQty);
  if (Number.isNaN(v) || v < 0 || !Number.isInteger(v)) return true;
  return v > maxReturnForRow(row);
};

/**
 * Remaining pool capacity surfaced on the parent row (and on
 * orphan / single-item rows that have no group).
 *
 *   For a parent in a group:
 *     remaining = parent.outQty − parent.returnQty − Σ(all group rows' soldQty)
 *   For an orphan / single item:
 *     remaining = row.outQty − row.returnQty − row.soldQty
 *
 * Child rows render "—" because every row in a group would show the
 * same number — duplicating it on every child would just be noise.
 * A negative value means the admin has over-allocated the pool;
 * `canClose` independently blocks submission in that case.
 */
const poolRemainingForRow = (row: (typeof form.items)[number]): number => {
  const g = groupOf(row);
  if (!g) {
    // Orphan / single item: just deduct return + own sold from out.
    const out = Math.max(0, Number(row.outQty) || 0);
    const ret = Math.max(0, Number(row.returnQty) || 0);
    const sold = Math.max(0, Number(row.soldQty) || 0);
    return out - ret - sold;
  }
  // Group parent: capacity minus what's already been allocated.
  const parentRow = form.items.find(
    (r) => (r.item?.id ?? r.itemId) === g.parentId,
  );
  if (!parentRow) return 0;
  const parentReturn = Math.max(0, Number(parentRow.returnQty) || 0);
  const totalSold = form.items.reduce((sum, it) => {
    const isMember =
      g.memberIds.has(it.itemId) || (it.item?.id ?? it.itemId) === g.parentId;
    return isMember ? sum + Math.max(0, Number(it.soldQty) || 0) : sum;
  }, 0);
  return g.parentOutQty - parentReturn - totalSold;
};
const addPayment = () => {
  form.payments.push({ paymentMethod: "CASH", amount: 0 });
};
const removePayment = (idx: number) => {
  form.payments.splice(idx, 1);
};
const addAdjustment = () => {
  form.adjustments.push({ type: "SHORTAGE", amount: 0 });
};
const closeSession = async () => {
  if (!props.session || isClosed.value) return;
  submitting.value = true;
  try {
    await store.closeSession(props.session.id, {
      // Close-time wire shape: `itemId`, the two split sold columns
      // (`cashSoldQty`, `cashlessSoldQty`), and `returnQty` are
      // sent. The backend rolls `soldQty = cash + cashless`,
      // reconstructs `outQty = soldQty + returnQty`, and
      // revalidates against the morning count persisted at open.
      //
      // Per-row mapping (UI two-input model → wire):
      //   parent row : cashSoldQty     = admin's Terjual (Cash)
      //                cashlessSoldQty = admin's Terjual (QRIS)
      //                returnQty       = admin's Kembali input
      //   child row  : cashSoldQty     = admin's Terjual (Cash)
      //                cashlessSoldQty = admin's Terjual (QRIS)
      //                returnQty       = 0 (variants roll up under
      //                                    the parent's return total)
      //
      // The session sums stay consistent: total sold across rows
      // equals parent.outQty − parent.return, the same invariant
      // `canClose` validates.
      items: form.items.map((it) => {
        const isParent = isParentRow(it);
        // Sanitize both split inputs the same way the old single
        // `soldQty` input was sanitised. q-input emits `""` for
        // cleared numerics, so guard against that explicitly.
        const cash = Math.max(0, numOrZero(it.cashSoldQty));
        const cashless = Math.max(0, numOrZero(it.cashlessSoldQty));
        return {
          itemId: it.itemId,
          cashSoldQty: cash,
          cashlessSoldQty: cashless,
          returnQty: isParent ? numOrZero(it.returnQty) : 0,
        };
      }),
      payments: form.payments.map((p) => ({
        paymentMethod: p.paymentMethod,
        // Re-sanitise right before submit in case the user cleared
        // the input (q-input emits `""` for empty numerics).
        amount: numOrZero(p.amount),
        referenceNumber: p.referenceNumber,
        notes: p.notes,
      })),
      adjustments: form.adjustments.map((a) => ({
        type: a.type,
        amount: numOrZero(a.amount),
        reason: a.reason,
      })),
      notes: form.notes,
    });
    const closed = store.currentSession ?? props.session;
    emit("closed", closed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    $q.notify({
      type: "negative",
      message: "Gagal menutup sesi.",
      caption: message,
    });
  } finally {
    submitting.value = false;
  }
};
// formatCurrency imported from @/composables/format
const formatTime = (iso?: string): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", { hour12: false });
};
</script>

<style scoped lang="scss">
// Red outline on q-inputs whose return value violates the parent-share
// rule. Stays inline with the input control (no extra vertical space).
:deep(.qty-invalid .q-field__control) {
  box-shadow: inset 0 0 0 1px var(--q-negative, #c10015) !important;
}

// Pin the return qty input to match sibling numeric columns.
:deep(.q-table td .q-field--dense .q-field__control) {
  min-height: 36px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
