<template>
  <t-select
    v-model="model"
    :api="api"
    :endpoint="'/api/employees'"
    label="Pilih Karyawan"
    :mapper="toMapper"
  ></t-select>
</template>

<script lang="ts" setup>
import type { QSelectValue } from "@/types/components/tselect";
import { api } from "@/boot/axios";
import TSelect from "@/components/~global/select/TSelect.vue";
import type { EmployeeResponse } from "./types/employee";

const model = defineModel<QSelectValue<EmployeeResponse> | undefined>();

const toMapper = (args: unknown): QSelectValue => {
  const item = args as EmployeeResponse;
  const fullName = `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim();
  return {
    value: item.id || "",
    label: fullName || item.email || item.id,
    object: item,
  };
};
</script>
