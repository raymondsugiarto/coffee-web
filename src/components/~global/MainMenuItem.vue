<template>
  <template v-for="(item, index) in menus" :key="index">
    <q-expansion-item
      v-if="item.children ? item.children.length > 0 : false"
      :label="item.label"
      :icon="item.icon"
      :model-value="expandedOf(item)"
      header-class="text-primary"
      ref="expansionItemRef"
    >
      <q-card class="q-pl-md">
        <MainMenuItem
          :menus="item.children ? item.children : []"
        ></MainMenuItem>
      </q-card>
    </q-expansion-item>
    <q-item
      v-else
      clickable
      v-ripple
      :to="item.to"
      :active="route.meta.id === item.id"
      active-class="bg-primary text-white"
    >
      <q-item-section avatar>
        <q-icon
          :color="route.meta.id === item.id ? 'white' : 'primary'"
          :name="item.icon"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ item.label }}</q-item-label>
      </q-item-section>
    </q-item>
  </template>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import MainMenuItem from "@global/MainMenuItem.vue";
import type { PropType } from "vue";
import type { MenuItem } from "./menu";

const route = useRoute();

defineProps({
  menus: {
    type: Object as PropType<MenuItem[]>,
    required: true,
  },
});

function expandedOf(item: MenuItem): boolean | null {
  return item.expanded ?? null;
}
</script>
