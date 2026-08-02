<template>
  <q-card flat bordered>
    <q-card-section class="row items-center q-py-sm bg-orange-1">
      <div class="text-h6 text-orange-9">Stok &amp; Penjualan</div>
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
          <div v-if="parentNameFor(props.row)" class="text-caption text-grey-7">
            <q-icon name="account_tree" size="14px" class="q-mr-xs" />
            Induk: {{ parentNameFor(props.row) }}
          </div>
        </q-td>
      </template>

      <template #body-cell-outQty="props">
        <q-td :props="props" class="text-right">
          <q-badge v-if="!isChildRow(props.row)" color="blue-8">
            {{ props.row.outQty }}
          </q-badge>
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
            Per-row Terjual is a derived sum of two captures: Cash +
            QRIS. The rolled `soldQty` lives on the row as a getter
            (computed from the two inputs) so subtotal / pool-
            remaining / invalid-flag all read the right number
            without a manual sync.
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

      <template #body-cell-cashPrice="props">
        <q-td :props="props" class="text-right">
          {{
            formatCurrency(
              Math.max(0, Number(props.row.cashSoldQty) || 0) *
                Number(props.row.sellingPriceSnapshot),
            )
          }}
        </q-td>
      </template>

      <template #body-cell-qrisPrice="props">
        <q-td :props="props" class="text-right">
          {{
            formatCurrency(
              Math.max(0, Number(props.row.cashlessSoldQty) || 0) *
                Number(props.row.sellingPriceSnapshot),
            )
          }}
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
</template>

<script setup lang="ts">
import type { QTableColumn } from "quasar";
import { formatCurrency } from "./evening-form";
import type {
  EveningFormState,
  EveningTotals,
  ItemRow,
  EveningFormItem,
} from "./evening-form";

const props = defineProps<{
  form: EveningFormState;
  totals: EveningTotals;
  totalItems: number;
  isClosed: boolean;
  isLoadingChildren: boolean;
  isParentRow: (row: EveningFormItem) => boolean;
  isChildRow: (row: EveningFormItem) => boolean;
  isParentReturnInvalid: (row: EveningFormItem) => boolean;
  isSoldInvalid: (row: EveningFormItem) => boolean;
  poolRemainingForRow: (row: EveningFormItem) => number;
  outQtyForRow: (row: EveningFormItem) => number;
  parentNameFor: (row: EveningFormItem) => string | null;
  onSoldSplitChanged: (row: EveningFormItem) => void;
}>();

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
    field: (r: ItemRow) => props.poolRemainingForRow(r as EveningFormItem),
    align: "right",
    sortable: false,
  },
  {
    name: "cashPrice",
    label: "Harga (Cash)",
    field: (r: ItemRow) =>
      Math.max(0, Number(r.cashSoldQty) || 0) * Number(r.sellingPriceSnapshot),
    align: "right",
    sortable: false,
  },
  {
    name: "qrisPrice",
    label: "Harga (Qris)",
    field: (r: ItemRow) =>
      Math.max(0, Number(r.cashlessSoldQty) || 0) *
      Number(r.sellingPriceSnapshot),
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
