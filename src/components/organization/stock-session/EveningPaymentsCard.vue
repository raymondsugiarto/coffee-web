<template>
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
            :options="PAYMENT_METHODS"
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
</template>

<script setup lang="ts">
import type { QTableColumn } from "quasar";
import {
  PAYMENT_METHODS,
  type EveningFormState,
  type PaymentRow,
} from "./evening-form";

defineProps<{
  form: EveningFormState;
  isClosed: boolean;
  addPayment: () => void;
  removePayment: (idx: number) => void;
}>();

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
</script>
