<template>
  <t-select
    v-model="model"
    :api="api"
    :endpoint="'/api/companies'"
    label="Pilih Company"
    :mapper="toMapper"
  ></t-select>
</template>

<script lang="ts" setup>
import type { QSelectValue } from "@/types/components/tselect";
import { api } from "@/boot/axios";
import TSelect from "@/components/~global/select/TSelect.vue";
import type { CompanyResponse } from "./types/company";

const model = defineModel<QSelectValue<CompanyResponse> | undefined>();

const toMapper = (args: unknown): QSelectValue => {
  const item = args as CompanyResponse;
  return {
    value: item.id || "",
    label: item.name,
    object: item,
  };
};
</script>
