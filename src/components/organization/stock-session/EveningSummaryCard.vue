<template>
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
        :model-value="form.notes"
        type="textarea"
        outlined
        autogrow
        label="Catatan (opsional)"
        :disable="isClosed"
        @update:model-value="updateNotes"
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
        @click="onClose"
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
</template>

<script setup lang="ts">
import {
  formatCurrency,
  type EveningFormState,
  type EveningTotals,
} from "./evening-form";
import type { StockSessionDto } from "./types/stock-session";

const props = defineProps<{
  form: EveningFormState;
  totals: EveningTotals;
  differenceClass: string;
  isClosed: boolean;
  submitting: boolean;
  canClose: boolean;
  session: StockSessionDto | null;
  updateNotes: (value: string | number | null) => void;
  closeSession: (session: StockSessionDto) => Promise<StockSessionDto | null>;
}>();

const onClose = async () => {
  if (!props.session) return;
  await props.closeSession(props.session);
};
</script>
