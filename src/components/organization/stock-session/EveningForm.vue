<template>
  <div>
    <!-- Session Header -->
    <EveningSessionHeader :session="session" />

    <!-- Items Table -->
    <EveningItemsTable
      :form="ctx.form"
      :totals="ctx.totals.value"
      :total-items="ctx.totalItems.value"
      :is-closed="ctx.isClosed.value"
      :is-loading-children="ctx.isLoadingChildren.value"
      :is-parent-row="ctx.isParentRow"
      :is-child-row="ctx.isChildRow"
      :is-parent-return-invalid="ctx.isParentReturnInvalid"
      :is-sold-invalid="ctx.isSoldInvalid"
      :pool-remaining-for-row="ctx.poolRemainingForRow"
      :out-qty-for-row="ctx.outQtyForRow"
      :parent-name-for="ctx.parentNameFor"
      :on-sold-split-changed="ctx.onSoldSplitChanged"
    />

    <!-- Payments + Adjustments -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-7">
        <EveningPaymentsCard
          :form="ctx.form"
          :is-closed="ctx.isClosed.value"
          :add-payment="ctx.addPayment"
          :remove-payment="ctx.removePayment"
        />
      </div>
      <div class="col-12 col-md-5">
        <EveningAdjustmentsCard
          :form="ctx.form"
          :is-closed="ctx.isClosed.value"
          :add-adjustment="ctx.addAdjustment"
          :remove-adjustment="ctx.removeAdjustment"
        />
      </div>
    </div>

    <!-- Summary Footer -->
    <EveningSummaryCard
      :form="ctx.form"
      :totals="ctx.totals.value"
      :difference-class="ctx.differenceClass.value"
      :is-closed="ctx.isClosed.value"
      :submitting="ctx.submitting.value"
      :can-close="ctx.canClose.value"
      :session="session"
      :close-session="ctx.closeSession"
      :update-notes="ctx.updateNotes"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, toRef } from "vue";
import type { StockSessionDto } from "./types/stock-session";
import { useEveningForm } from "./evening-form";
import EveningSessionHeader from "./EveningSessionHeader.vue";
import EveningItemsTable from "./EveningItemsTable.vue";
import EveningPaymentsCard from "./EveningPaymentsCard.vue";
import EveningAdjustmentsCard from "./EveningAdjustmentsCard.vue";
import EveningSummaryCard from "./EveningSummaryCard.vue";

const props = defineProps<{
  session: StockSessionDto | null;
}>();

const emit = defineEmits<{
  (e: "closed", session: StockSessionDto): void;
}>();

// `toRef` keeps the composable's watcher reactive to the prop's
// upstream changes (parent may swap the session object in place).
const sessionPropRef = toRef(props, "session");

const ctx = useEveningForm(sessionPropRef, (closed) => emit("closed", closed));

onMounted(() => {
  void ctx.onFormMounted();
});
</script>
