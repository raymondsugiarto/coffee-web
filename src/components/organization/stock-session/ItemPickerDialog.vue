<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Pilih Produk</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="search"
          outlined
          dense
          placeholder="Cari produk (nama / SKU)..."
          autofocus
          @keydown.enter.prevent="focusFirstRow"
          @keyup="onSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-list separator class="q-mt-sm scroll" style="max-height: 50vh">
          <q-item
            v-for="p in filteredItems"
            :key="p.id"
            clickable
            v-ripple
            :active="selectedId === p.id"
            active-class="bg-blue-1 text-blue-9"
            @click="pick(p)"
            @dblclick="pickAndClose(p)"
          >
            <q-item-section>
              <q-item-label>{{ p.name }}</q-item-label>
              <q-item-label caption>{{ p.sku }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-weight-bold">
                {{ formatCurrency(p.sellingPrice) }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="filteredItems.length === 0">
            <q-item-section class="text-grey">Tidak ada produk.</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Batal" v-close-popup />
        <q-btn
          color="primary"
          label="Pilih"
          :disable="!selectedId"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import type { ItemDto } from "./types/stock-session";

const props = defineProps<{
  modelValue: boolean;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "pick", item: ItemDto): void;
}>();

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const store = useStockSessionStore();
const search = ref("");
const selectedId = ref<string>("");
const selectedItem = ref<ItemDto | null>(null);

const filteredItems = computed(() => {
  const q = search.value.toLowerCase().trim();
  return store.items.filter(
    (p) =>
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
  );
});

watch(show, async (open) => {
  if (open) {
    search.value = "";
    selectedId.value = "";
    selectedItem.value = null;
    await store.fetchItems();
  }
});

const onSearch = () => {
  // server-side search could replace this if corpus is large
};

const pick = (p: ItemDto) => {
  selectedId.value = p.id;
  selectedItem.value = p;
};

const pickAndClose = (p: ItemDto) => {
  emit("pick", p);
  show.value = false;
};

const focusFirstRow = () => {
  if (filteredItems.value[0]) pickAndClose(filteredItems.value[0]);
};

const confirm = () => {
  if (selectedItem.value) {
    emit("pick", selectedItem.value);
    show.value = false;
  }
};

const formatCurrency = (n: number): string =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n));
</script>
