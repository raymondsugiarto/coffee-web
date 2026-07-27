<template>
  <q-dialog
    v-model="show"
    :position="dialogPosition"
    :maximized="isMobile"
    persistent
  >
    <q-card class="picker-card" :class="{ 'picker-card--mobile': isMobile }">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-sm picker-header">
        <q-icon
          name="shopping_basket"
          size="22px"
          color="primary"
          class="q-mr-sm"
        />
        <div class="text-subtitle1 text-h6-sm text-weight-bold">
          Pilih Produk
        </div>
        <q-space />
        <q-chip
          v-if="selectedItems.length > 0"
          color="primary"
          text-color="white"
          dense
          :label="`${selectedItems.length} dipilih`"
          class="q-mr-sm"
        />
        <q-btn
          icon="close"
          flat
          round
          dense
          size="md"
          aria-label="Tutup"
          @click="show = false"
        />
      </q-card-section>

      <!-- Search -->
      <q-card-section class="q-pt-none q-pb-sm">
        <q-input
          v-model="search"
          outlined
          dense
          placeholder="Cari produk (nama / SKU)..."
          autofocus
          input-class="search-input"
          @keydown.enter.prevent="toggleFirstVisible"
          @keyup="onSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
          <template #append v-if="search">
            <q-icon name="cancel" class="cursor-pointer" @click="search = ''" />
          </template>
        </q-input>
      </q-card-section>

      <!-- Select-all / clear toolbar -->
      <q-card-section
        v-if="!loading && filteredItems.length > 0"
        class="q-pt-none q-pb-xs row items-center"
      >
        <q-checkbox
          :model-value="allVisibleSelected"
          :indeterminate.prop="someVisibleSelected"
          dense
          :label="
            allVisibleSelected
              ? `Hapus pilihan (${selectedItems.length})`
              : `Pilih semua yang terlihat (${filteredItems.length})`
          "
          @update:model-value="toggleAllVisible"
        />
        <q-space />
        <span v-if="selectedItems.length > 0" class="text-caption text-grey-7">
          {{ selectedItems.length }} dari {{ filteredItems.length }}
        </span>
      </q-card-section>

      <!-- Item list -->
      <q-card-section class="q-pt-none picker-list-wrap">
        <q-list separator class="picker-list scroll">
          <q-item
            v-for="p in filteredItems"
            :key="p.id"
            clickable
            v-ripple
            :active="isSelected(p.id)"
            active-class="bg-blue-1 text-blue-9"
            class="picker-item"
            @click="toggle(p)"
          >
            <q-item-section avatar>
              <q-checkbox
                :model-value="isSelected(p.id)"
                @update:model-value="toggle(p)"
                @click.stop
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{
                p.name
              }}</q-item-label>
              <q-item-label caption>SKU: {{ p.sku }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-weight-bold text-subtitle1">
                {{ formatCurrency(p.sellingPrice) }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <div
            v-if="!loading && filteredItems.length === 0"
            class="empty-state"
          >
            <q-icon name="inventory_2" size="48px" color="grey-5" />
            <div class="text-subtitle1 text-grey-6 q-mt-sm">
              Tidak ada produk
            </div>
            <div v-if="search" class="text-caption text-grey-5">
              Coba kata kunci lain
            </div>
          </div>

          <div v-if="loading" class="text-center q-pa-md text-grey-6">
            <q-spinner-dots size="32px" color="primary" />
          </div>
        </q-list>
      </q-card-section>

      <!-- Action bar -->
      <q-card-actions class="picker-actions q-px-md q-py-sm">
        <q-btn
          flat
          label="Batal"
          no-caps
          color="grey-8"
          class="action-btn"
          @click="show = false"
        />
        <q-btn
          color="primary"
          unelevated
          label="Pilih"
          no-caps
          icon="check"
          class="action-btn"
          :disable="selectedItems.length === 0"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import { formatCurrency } from "@/composables/format";
import type { ItemDto } from "./types/stock-session";

const props = defineProps<{
  modelValue: boolean;
  /**
   * Items that should start checked when the dialog opens (for example,
   * products already added to the session). Used to preserve previous
   * selections if the admin reopens the picker.
   */
  preSelectedIds?: string[];
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  /**
   * Fired when the user picks one product from the dialog (kept for
   * backward-compatibility). With multi-select, also used as a per-row
   * hook if the picker is wired to "append" mode.
   */
  (e: "pick", item: ItemDto): void;
  /**
   * Fired when the user confirms a multi-select. Carries the array of
   * newly picked products (already filtered for any IDs the caller
   * prepended).
   */
  (e: "pick-multiple", items: ItemDto[]): void;
}>();

const $q = useQuasar();
const store = useStockSessionStore();

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const search = ref("");
const selectedIds = ref<Set<string>>(new Set());
const loading = ref(false);

const isMobile = computed(() => $q.screen.lt.sm);
const dialogPosition = computed(() => (isMobile.value ? "bottom" : "standard"));

const filteredItems = computed(() => {
  const q = search.value.toLowerCase().trim();
  return store.items.filter(
    (p) =>
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
  );
});

const selectedItems = computed<ItemDto[]>(() =>
  store.items.filter((p) => selectedIds.value.has(p.id)),
);

const isSelected = (id: string): boolean => selectedIds.value.has(id);

const allVisibleSelected = computed(
  () =>
    filteredItems.value.length > 0 &&
    filteredItems.value.every((p) => selectedIds.value.has(p.id)),
);

const someVisibleSelected = computed(() => {
  const visible = filteredItems.value;
  return (
    visible.some((p) => selectedIds.value.has(p.id)) &&
    !allVisibleSelected.value
  );
});

const toggle = (p: ItemDto): void => {
  const set = new Set(selectedIds.value);
  if (set.has(p.id)) set.delete(p.id);
  else set.add(p.id);
  selectedIds.value = set;
};

const toggleAllVisible = (): void => {
  const visible = filteredItems.value;
  if (allVisibleSelected.value) {
    const set = new Set(selectedIds.value);
    for (const p of visible) set.delete(p.id);
    selectedIds.value = set;
  } else {
    const set = new Set(selectedIds.value);
    for (const p of visible) set.add(p.id);
    selectedIds.value = set;
  }
};

watch(show, async (open) => {
  if (open) {
    search.value = "";
    selectedIds.value = new Set(props.preSelectedIds ?? []);
    loading.value = true;
    try {
      await store.fetchItems();
    } finally {
      loading.value = false;
    }
  }
});

const onSearch = () => {
  // server-side search could replace this if corpus is large
};

const toggleFirstVisible = () => {
  const first = filteredItems.value[0];
  if (first) toggle(first);
};

const confirm = (): void => {
  const picked = selectedItems.value;
  // Emit individual @pick first for any existing single-row handlers
  // (back-compat), then a single @pick-multiple with the array.
  for (const p of picked) emit("pick", p);
  emit("pick-multiple", picked);
  selectedIds.value = new Set();
  show.value = false;
};

// formatCurrency imported from @/composables/format
</script>

<style scoped lang="scss">
.picker-card {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

// mobile: full-screen sheet
.picker-card--mobile {
  max-width: 100%;
  max-height: 100%;
  height: 100%;
  border-radius: 0;
}

.picker-header {
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.picker-list-wrap {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

.picker-list {
  flex: 1 1 auto;
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.picker-actions {
  border-top: 1px solid #e0e0e0;
  background: white;
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1 1 0;
  min-height: 44px;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  width: 100%;
}

.search-input {
  font-size: 16px; // avoids iOS zoom on focus
}

// Larger touch targets on mobile
@media (max-width: 599px) {
  .picker-item {
    min-height: 64px;
  }

  .picker-actions {
    padding-bottom: env(safe-area-inset-bottom, 12px);
  }
}

// Inline / non-stretch buttons on desktop
@media (min-width: 600px) {
  .action-btn {
    flex: 0 0 auto;
    min-width: 120px;
  }

  .text-h6-sm {
    font-size: 1.25rem;
  }
}
</style>
