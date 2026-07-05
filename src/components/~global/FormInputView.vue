<template>
  <div class="row q-mb-md">
    <div class="col-6 col-md-2 text-bold">{{ props.label }}:</div>
    <div class="col-auto" v-if="!isHtmlValue">: {{ props.value }}</div>
    <div class="col-auto" v-if="isHtmlValue" v-html="props.value"></div>
  </div>
</template>

<script lang="ts" setup>
interface FormInputViewProps {
  label: string;
  value: string | number;
  isHtmlValue?: boolean;
}
const props = defineProps<FormInputViewProps>();
</script>
