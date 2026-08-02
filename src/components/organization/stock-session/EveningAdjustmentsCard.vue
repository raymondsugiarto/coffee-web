<template>
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
            :options="ADJUSTMENT_TYPES"
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
            @click="removeAdjustment(idx)"
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
</template>

<script setup lang="ts">
import { ADJUSTMENT_TYPES, type EveningFormState } from "./evening-form";

defineProps<{
  form: EveningFormState;
  isClosed: boolean;
  addAdjustment: () => void;
  removeAdjustment: (idx: number) => void;
}>();
</script>
