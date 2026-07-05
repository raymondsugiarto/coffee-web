<template>
  <q-card flat bordered :class="cardClass">
    <q-card-section class="q-py-md">
      <div class="text-caption text-grey-7">{{ label }}</div>
      <div class="text-h6 text-weight-bold" :class="valueClass">
        {{ value }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  value: string | number;
  color?: "orange" | "green" | "purple" | "red" | "blue";
}>();

const cardClass = computed(() => {
  switch (props.color) {
    case "orange":
      return "bg-orange-1";
    case "green":
      return "bg-green-1";
    case "purple":
      return "bg-purple-1";
    case "red":
      return "bg-red-1";
    case "blue":
      return "bg-blue-1";
    default:
      return "";
  }
});

const valueClass = computed(() => {
  switch (props.color) {
    case "orange":
      return "text-orange-9";
    case "green":
      return "text-green-9";
    case "purple":
      return "text-purple-9";
    case "red":
      return "text-red-9";
    case "blue":
      return "text-blue-9";
    default:
      return "";
  }
});
</script>
