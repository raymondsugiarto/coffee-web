<template>
  <div class="morning-form">
    <!-- ====== Header ====== -->
    <q-card flat bordered class="q-mb-md bg-blue-1">
      <q-card-section class="q-col-gutter-md q-pa-md">
        <div class="row items-center no-wrap q-mb-sm">
          <q-icon name="wb_sunny" size="22px" color="blue-9" class="q-mr-sm" />
          <div class="text-h6 text-blue-9 text-weight-bold">
            Morning Session
          </div>
          <q-space />
          <q-chip
            dense
            color="blue-8"
            text-color="white"
            icon="today"
            :label="form.date"
            class="q-mr-none"
          />
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="form.date"
              outlined
              dense
              label="Tanggal"
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
          <div class="col-12 col-sm-6 col-md-9">
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
        </div>
      </q-card-section>
    </q-card>

    <!-- ====== Items ====== -->
    <q-card flat bordered>
      <q-card-section class="row items-center q-py-sm q-px-md">
        <div class="text-subtitle1 text-blue-9 text-weight-medium">
          Produk yang Dibawa
        </div>
        <q-space />
        <q-chip
          color="blue-8"
          text-color="white"
          dense
          icon="inventory_2"
          :label="`${form.items.length} item`"
        />
        <!-- <q-btn
          color="primary"
          icon="add"
          :label="$q.screen.gt.xs ? 'Tambah Produk' : ''"
          no-caps
          unelevated
          class="q-ml-sm"
          @click="openPicker"
        >
          <q-tooltip
            v-if="$q.screen.xs"
            anchor="top middle"
            self="bottom middle"
          >
            Tambah Produk
          </q-tooltip>
        </q-btn> -->
      </q-card-section>
      <q-separator />

      <!-- Empty state -->
      <div v-if="form.items.length === 0" class="empty-state">
        <q-icon name="shopping_basket" size="56px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-sm">Belum ada produk</div>
        <div class="text-caption text-grey-5">
          Tekan tombol + untuk menambah
        </div>
      </div>

      <!-- Mobile: card list -->
      <div v-else-if="$q.screen.lt.md" class="mobile-item-list">
        <div
          v-for="(it, idx) in form.items"
          :key="it.itemId"
          class="mobile-item-card"
        >
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-weight-medium ellipsis">
                {{ it.item?.name ?? "-" }}
              </div>
              <div class="text-caption text-grey-7">
                SKU: {{ it.item?.sku ?? "-" }}
              </div>
              <div
                v-if="it.item?.parent?.name ?? it.item?.parentId"
                class="text-caption text-grey-7 q-mt-xs"
              >
                <q-icon name="account_tree" size="14px" class="q-mr-xs" />
                Induk: {{ it.item?.parent?.name ?? it.item?.parentId }}
              </div>
              <div class="text-caption text-blue-9 text-weight-bold">
                {{ formatCurrency(it.sellingPriceSnapshot) }}
              </div>
            </div>
            <q-btn
              icon="delete"
              color="negative"
              flat
              round
              dense
              @click="removeItem(idx)"
            />
          </div>
          <div class="row q-col-gutter-sm q-mt-sm items-end item-inputs">
            <div class="col">
              <q-input
                v-model.number="it.sellingPriceSnapshot"
                type="number"
                dense
                outlined
                label="Harga"
                :readonly="!!it.item"
                @update:model-value="recalc"
              />
            </div>
            <div class="col-5">
              <q-input
                v-model.number="it.outQty"
                type="number"
                dense
                outlined
                label="Out Qty"
                :min="1"
                :class="{ 'qty-invalid': !isOutQtyValid(it) }"
                @update:model-value="recalc"
              />
            </div>
          </div>
          <div class="row items-center q-mt-xs">
            <div class="text-caption text-grey-7">Subtotal</div>
            <q-space />
            <div class="text-subtitle2 text-weight-bold text-blue-9">
              {{ formatCurrency(it.subtotal) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: q-table -->
      <q-table
        v-else
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
              :readonly="!!props.row.item"
              input-class="text-left"
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
              :min="1"
              :class="{ 'qty-invalid': !isOutQtyValid(props.row) }"
              input-class="text-left"
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

      <q-separator v-if="form.items.length > 0" />
      <q-card-section
        v-if="form.items.length > 0"
        class="row items-center bg-grey-2 q-py-md"
      >
        <div class="text-subtitle1">Total Estimasi</div>
        <q-space />
        <div class="text-h6 text-blue-9 text-weight-bold">
          {{ formatCurrency(totalSubtotal) }}
        </div>
      </q-card-section>
    </q-card>

    <!-- <ItemPickerDialog
      v-model="pickerOpen"
      :pre-selected-ids="form.items.map((it) => it.itemId)"
      @pick="onPickItem"
      @pick-multiple="onPickItems"
    /> -->

    <!-- ====== Action Footer (responsive) ====== -->
    <div class="action-footer">
      <div class="action-footer-inner">
        <q-btn
          flat
          label="Reset"
          no-caps
          color="grey-8"
          class="action-btn"
          @click="reset"
        />
        <q-btn
          color="primary"
          unelevated
          icon="check"
          label="Buka Sesi"
          no-caps
          :disable="!canSubmit"
          :loading="submitting"
          class="action-btn"
          @click="submit"
        />
      </div>
      <div v-if="!canSubmit && invalidItemNames.length > 0" class="action-hint">
        <q-icon name="warning" size="16px" color="orange-9" class="q-mr-xs" />
        Qty harus lebih besar dari 0 untuk:
        <span class="text-weight-medium">{{
          invalidItemNames.join(", ")
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { date, useQuasar } from "quasar";
import type { QTableColumn } from "quasar";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import { formatCurrency } from "@/composables/format";
import type {
  DriverDto,
  StockSessionItemInputDto,
} from "./types/stock-session";

type FormItem = StockSessionItemInputDto & {
  sellingPriceSnapshot: number;
  subtotal: number;
};

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
  soldQty: number;
  sellingPriceSnapshot: number;
  subtotal: number;
}

const emit = defineEmits<{
  (e: "saved"): void;
}>();

const $q = useQuasar();
const store = useStockSessionStore();

const form = reactive({
  employeeId: "",
  date: date.formatDate(new Date(), "YYYY-MM-DD"),
  items: [] as FormItem[],
});

const drivers = ref<DriverDto[]>([]);
const submitting = ref(false);

const itemColumns: QTableColumn<ItemRow>[] = [
  {
    name: "name",
    label: "Produk",
    field: (r) => r.item?.name ?? "-",
    align: "left",
    sortable: false,
  },
  {
    name: "sku",
    label: "SKU",
    field: (r) => r.item?.sku ?? "-",
    align: "left",
    sortable: false,
  },
  {
    name: "parentId",
    label: "Item Induk",
    field: (r) =>
      r.item?.parent?.name ?? (r.item?.parentId ? r.item.parentId : "—"),
    align: "left",
    sortable: false,
  },
  {
    name: "sellingPriceSnapshot",
    label: "Harga Jual",
    field: "sellingPriceSnapshot",
    align: "left",
    sortable: false,
  },
  {
    name: "outQty",
    label: "Out Qty",
    field: "outQty",
    align: "left",
    sortable: false,
  },
  {
    name: "subtotal",
    label: "Subtotal",
    field: "subtotal",
    align: "right",
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

const isOutQtyValid = (it: FormItem): boolean =>
  Number.isInteger(it.outQty) && (it.outQty ?? 0) >= 1;

const invalidItemNames = computed(() =>
  form.items
    .filter((it) => !Number.isInteger(it.outQty) || (it.outQty ?? 0) < 1)
    .map((it) => it.item?.name ?? it.itemId),
);

const canSubmit = computed(
  () =>
    !!form.employeeId &&
    !!form.date &&
    form.items.length > 0 &&
    invalidItemNames.value.length === 0,
);

const filterDrivers = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    void store.fetchDrivers(val).then((res) => {
      drivers.value = res;
    });
  });
};

const onDriverChange = async (val: DriverDto) => {
  console.log(val);
  if (!form.employeeId) return;
  const existing = await store.getTodaySession(form.employeeId, form.date);
  if (existing) {
    $q.notify({
      type: "warning",
      message: `Driver ini sudah punya sesi pada ${form.date}.`,
      caption: existing.id,
    });
  }
  await loadItems();
};

// ====== Load items for the selected driver ======
const loading = ref(false);
const loadItems = async () => {
  if (!form.employeeId) return;
  try {
    await store.fetchItems(form.employeeId, "", {
      session: "MORNING",
    }); // employeeId = adminID
  } finally {
    loading.value = false;
  }
  // Pre-fill the form with the driver's items, but only if the form is
  // currently empty (i.e. the admin hasn't already added some items).
  form.items = store.items.map((it) => ({
    itemId: it.id,
    item: it,
    outQty: 0,
    returnQty: 0,
    sellingPriceSnapshot: it.sellingPrice,
    subtotal: 0,
    cashlessSoldQty: 0,
    cashSoldQty: 0,
    soldQty: 0,
  }));
};

// const openPicker = () => {
//   // Capture the row snapshot at open-time so the dialog's final
//   // selection can be reconciled as additions vs. removals.
//   dialogOpenSnapshot = new Set(form.items.map((it) => it.itemId));
//   pickerOpen.value = true;
// };

// Snapshot taken when the picker dialog opens. Used to reconcile
// additions vs removals when the dialog emits its final selection.
// `form.items` snapshot is taken via `openPicker` and read here.
// const dialogOpenSnapshot = new Set<string>();

// const onPickItem = (p: ItemDto) => {
//   if (form.items.some((it) => it.itemId === p.id)) {
//     return;
//   }
//   form.items.push({
//     itemId: p.id,
//     item: p,
//     outQty: 0,
//     returnQty: 0,
//     sellingPriceSnapshot: p.sellingPrice,
//     subtotal: 0,
//   } as FormItem);
// };

/**
 * Multi-select handler fired by the picker dialog when the admin taps
 * "Pilih". Reconciles the form against the dialog's final selection:
 *
 *   - items checked in the dialog that were NOT in form.items → append
 *   - items that WERE in form.items but unchecked in the dialog → remove
 *   - items present in both → unchanged (e.g. admin toggled & re-toggled)
 *
 * The snapshot is captured at dialog-open time so we only act on
 * items the admin actually touches, not on rows that were already in
 * the form from some earlier interaction.
 */
// const onPickItems = (picks: ItemDto[]): void => {
//   const finalIds = new Set(picks.map((p) => p.id));
//   // Removals: items that were in the snapshot but are now unchecked.
//   const toRemove = [...dialogOpenSnapshot].filter((id) => !finalIds.has(id));
//   for (const id of toRemove) {
//     const idx = form.items.findIndex((it) => it.itemId === id);
//     if (idx >= 0) form.items.splice(idx, 1);
//   }
//   // Additions: items now checked that weren't there.
//   let added = 0;
//   for (const p of picks) {
//     if (form.items.some((it) => it.itemId === p.id)) continue;
//     form.items.push({
//       itemId: p.id,
//       item: p,
//       outQty: 0,
//       returnQty: 0,
//       sellingPriceSnapshot: p.sellingPrice,
//       subtotal: 0,
//     } as FormItem);
//     added++;
//   }
//   dialogOpenSnapshot = finalIds; // refresh for next open
//   // Friendly feedback when only removals happened (no toast spam).
//   if (added === 0 && toRemove.length === 0) {
//     $q.notify({
//       type: "info",
//       message: "Tidak ada perubahan pada produk yang dibawa.",
//     });
//   }
// };

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
  form.date = date.formatDate(new Date(), "YYYY-MM-DD");
  form.items = [];
};

defineExpose({ reset });

const submit = async () => {
  if (!canSubmit.value) {
    $q.notify({
      type: "negative",
      message: "Qty tiap produk harus lebih besar dari 0.",
    });
    return;
  }
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
    emit("saved");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    $q.notify({
      type: "negative",
      message: "Gagal membuka sesi.",
      caption: message,
    });
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  drivers.value = await store.fetchDrivers();
});
</script>

<style scoped lang="scss">
.morning-form {
  // leave room on mobile so the sticky footer doesn't cover content
  padding-bottom: 96px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #9e9e9e;
}

// ----- Mobile item card list -----
.mobile-item-list {
  display: flex;
  flex-direction: column;
}

.mobile-item-card {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

// ----- Responsive action footer -----
.action-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
  margin-top: 16px;
}

.action-footer-inner {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  max-width: 1280px;
  margin: 0 auto;
  align-items: stretch;
}

.action-btn {
  flex: 1 1 0;
  min-height: 44px;
  font-size: 14px;
}

// On larger screens the footer is inline
@media (min-width: 600px) {
  .morning-form {
    padding-bottom: 16px;
  }

  .action-footer {
    position: static;
    background: transparent;
    border-top: none;
    box-shadow: none;
  }

  .action-btn {
    flex: 0 0 auto;
    min-width: 140px;
  }
}

// Larger numeric inputs on mobile
@media (max-width: 599px) {
  :deep(.q-field--dense .q-field__native),
  :deep(.q-field--dense .q-field__input) {
    font-size: 16px; // avoids iOS zoom on focus
  }
}

.action-hint {
  font-size: 12px;
  color: #b26a00;
  background: #fff8e1;
  border-top: 1px solid #ffe0b2;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-wrap: wrap;
  gap: 2px;
}

// ----- Item row input alignment (desktop table + mobile cards) -----
// Keep the readonly "Harga" input visually consistent with the editable
// "Out Qty" input so the two columns align cleanly.
:deep(.q-table td .q-field--dense.q-field--readonly .q-field__control) {
  background: #f5f5f5;
  border-radius: 4px;
}

:deep(.q-table td .q-field--dense .q-field__control),
:deep(.mobile-item-card .q-field--dense .q-field__control) {
  min-height: 36px;
  padding-left: 8px;
  padding-right: 8px;
}

:deep(.q-table td .q-field--dense .q-field__input),
:deep(.mobile-item-card .q-field--dense .q-field__input) {
  padding: 4px 0;
}

// Pin the Harga + Out Qty row so the two input boxes share the same
// baseline. Without `align-items: flex-end` + a fixed-height control,
// Quasar fields with `:rules` reserve extra vertical space (error area)
// and push the Out Qty box down relative to the readonly Harga box.
.item-inputs {
  align-items: flex-end !important;
}

.item-inputs > div > .q-field--dense,
.item-inputs > div > .q-field--dense .q-field__control {
  min-height: 36px;
}

// Error indication for Out Qty without reserving message space.
.qty-invalid :deep(.q-field__control) {
  box-shadow: inset 0 0 0 1px var(--q-negative, #c10015) !important;
}
</style>
