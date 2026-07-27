<template>
  <q-page :padding="$q.screen.gt.xs ? true : false" class="item-list-page">
    <!-- ====== Header ====== -->
    <div class="row items-center q-mb-md q-px-sm q-px-md-none">
      <q-btn flat round icon="arrow_back" :to="{ name: 'dashboard' }" />
      <div class="text-h6 text-h5-sm text-weight-bold q-ml-sm">Produk</div>
      <q-space />
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Tambah Produk"
        no-caps
        @click="openCreate"
      >
        <q-tooltip v-if="$q.screen.xs" anchor="top middle" self="bottom middle">
          Tambah Produk
        </q-tooltip>
      </q-btn>
    </div>

    <div class="q-px-sm q-px-md-none">
      <!-- ====== Filter ====== -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="row items-center q-py-sm">
          <q-icon
            name="filter_alt"
            size="20px"
            color="primary"
            class="q-mr-xs"
          />
          <div class="text-subtitle1 text-weight-medium">Filter</div>
          <q-space />
          <q-btn
            flat
            dense
            no-caps
            color="grey-8"
            icon="refresh"
            label="Reset"
            @click="resetFilter"
          />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-py-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-6">
              <q-input
                v-model="filterQuery"
                outlined
                dense
                label="Cari nama / SKU / kode"
                clearable
                debounce="300"
                @update:model-value="onFilterChanged"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="filterCategory"
                :options="categoryOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                outlined
                dense
                label="Kategori"
                clearable
                @update:model-value="onFilterChanged"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ====== Mobile card list ====== -->
      <div v-if="$q.screen.lt.md" class="mobile-item-list">
        <div v-if="items.length === 0" class="empty-state text-center q-pa-xl">
          <q-icon name="inventory_2" size="56px" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-sm">Belum ada produk</div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Tambah"
            no-caps
            class="q-mt-md"
            @click="openCreate"
          />
        </div>
        <div v-for="it in items" :key="it.id" class="mobile-item-card">
          <div class="row items-center">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">{{ it.name }}</div>
              <div class="text-caption text-grey-7">
                {{ it.code || "-" }} · SKU {{ it.sku || "-" }}
              </div>
              <div class="text-caption text-grey-7">
                Kategori: {{ categoryNameFor(it.categoryId) }}
              </div>
              <div class="row q-mt-xs q-gutter-sm items-center">
                <q-chip
                  :color="it.isActive ? 'green-8' : 'grey-6'"
                  text-color="white"
                  dense
                  size="sm"
                  :icon="it.isActive ? 'check_circle' : 'block'"
                  :label="it.isActive ? 'Aktif' : 'Non-aktif'"
                />
                <div class="text-caption text-weight-medium">
                  Rp {{ formatPrice(it.sellingPrice) }}
                </div>
                <div class="text-caption text-grey-7">
                  Komisi: Rp {{ formatPrice(it.commision ?? 0) }}
                </div>
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                @click="openEdit(it)"
              />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmDelete(it)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ====== Desktop table ====== -->
      <q-card v-else flat bordered>
        <q-table
          :rows="items"
          :columns="columns"
          row-key="id"
          flat
          dense
          :loading="loading"
          :rows-per-page-options="[10, 25, 50]"
        >
          <template #body-cell-name="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.name }}</div>
              <div class="text-caption text-grey-7">
                {{ props.row.code }} · SKU {{ props.row.sku }}
              </div>
            </q-td>
          </template>
          <template #body-cell-category="props">
            <q-td :props="props">
              {{ categoryNameFor(props.row.categoryId) }}
            </q-td>
          </template>
          <template #body-cell-price="props">
            <q-td :props="props" class="text-right">
              Rp {{ formatPrice(props.row.sellingPrice) }}
            </q-td>
          </template>
          <template #body-cell-commision="props">
            <q-td :props="props" class="text-right">
              Rp {{ formatPrice(props.row.commision ?? 0) }}
            </q-td>
          </template>
          <template #body-cell-isActive="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.isActive ? 'green-8' : 'grey-6'"
                text-color="white"
                dense
                size="sm"
                :icon="props.row.isActive ? 'check_circle' : 'block'"
                :label="props.row.isActive ? 'Aktif' : 'Non-aktif'"
              />
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                @click="openEdit(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <template #no-data>
            <div class="text-center q-pa-xl text-grey">
              <q-icon name="inventory_2" size="48px" color="grey-5" />
              <div class="text-h6 q-mt-sm">Belum ada produk</div>
              <q-btn
                unelevated
                color="primary"
                icon="add"
                label="Tambah"
                no-caps
                class="q-mt-md"
                @click="openCreate"
              />
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- ====== Create / Edit dialog ====== -->
    <q-dialog v-model="dialogOpen" persistent full-width>
      <q-card style="max-width: 640px">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon
            :name="editingId ? 'edit' : 'add'"
            size="22px"
            class="q-mr-sm"
          />
          <div class="text-h6">
            {{ editingId ? "Edit Produk" : "Tambah Produk" }}
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input
            v-model="form.name"
            outlined
            dense
            label="Nama Produk *"
            autofocus
            :rules="[(v) => !!(v && v.trim().length > 0) || 'Nama wajib diisi']"
          />
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.code" outlined dense label="Kode" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.sku" outlined dense label="SKU" />
            </div>
          </div>
          <q-select
            v-model="form.categoryId"
            :options="categoryOptions"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            outlined
            dense
            label="Kategori"
            clearable
            hint="Opsional — boleh dikosongkan"
          />
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="form.sellingPrice"
                type="number"
                outlined
                dense
                label="Harga Jual *"
                min="0"
                :rules="[(v) => Number(v) >= 0 || 'Harga tidak valid']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="form.costPrice"
                type="number"
                outlined
                dense
                label="Harga Modal"
                min="0"
              />
            </div>
          </div>
          <q-input
            v-model.number="form.commision"
            type="number"
            outlined
            dense
            label="Komisi per Unit"
            hint="Komisi driver per unit terjual (Rp)"
            min="0"
            :rules="[(v) => Number(v) >= 0 || 'Komisi tidak valid']"
          />
          <q-toggle v-model="form.isActive" label="Aktif" color="green" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Batal" no-caps v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="editingId ? 'Simpan' : 'Tambah'"
            no-caps
            :loading="store.submitting"
            :disable="!isFormValid"
            @click="saveDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useQuasar, type QTableColumn } from "quasar";
import { useCatalogStore } from "@/stores/catalog/catalog-store";
import { formatCurrency } from "@/composables/format";
import type { ItemDto } from "@/components/organization/stock-session/types/stock-session";

const $q = useQuasar();
const store = useCatalogStore();

const filterQuery = ref("");
const filterCategory = ref<string | null>(null);
const loading = ref(false);

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
// `id` is required by the ItemDto type but only meaningful in edit
// mode — we leave it as an empty string while creating.
const form = ref<ItemDto>({
  id: "",
  categoryId: "",
  code: "",
  sku: "",
  name: "",
  sellingPrice: 0,
  costPrice: 0,
  commision: 0,
  isActive: true,
});

const items = computed<ItemDto[]>(() => store.items);
const categories = computed(() => store.categories);

const categoryOptions = computed(() => categories.value);

const categoryNameFor = (id: string): string => {
  const c = categories.value.find((x) => x.id === id);
  return c?.name ?? id ?? "-";
};

const formatPrice = (n: number): string =>
  formatCurrency(n).replace(/^Rp\s?/, "");

interface ItemRow {
  id: string;
  name: string;
  categoryId: string;
  sellingPrice: number;
  commision: number;
  isActive: boolean;
}

const columns: QTableColumn<ItemRow>[] = [
  {
    name: "name",
    label: "Produk",
    field: "name",
    align: "left",
    sortable: true,
  },
  {
    name: "category",
    label: "Kategori",
    field: "categoryId",
    align: "left",
    sortable: false,
  },
  {
    name: "price",
    label: "Harga Jual",
    field: "sellingPrice",
    align: "right",
    sortable: true,
  },
  {
    name: "commision",
    label: "Komisi",
    field: "commision",
    align: "right",
    sortable: true,
  },
  {
    name: "isActive",
    label: "Status",
    field: "isActive",
    align: "left",
    sortable: false,
  },
  {
    name: "actions",
    label: "",
    field: () => "",
    align: "right",
    sortable: false,
  },
];

// Category is intentionally NOT part of the validity gate — a
// product without a category is still a valid product. Name + a
// non-negative price are the only required fields.
const isFormValid = computed(
  () => !!form.value.name?.trim() && Number(form.value.sellingPrice) >= 0,
);

const onFilterChanged = async (): Promise<void> => {
  loading.value = true;
  try {
    await store.fetchItems({
      query: filterQuery.value ?? "",
    });
  } finally {
    loading.value = false;
  }
};

const resetFilter = async (): Promise<void> => {
  filterQuery.value = "";
  filterCategory.value = null;
  await onFilterChanged();
};

const openCreate = (): void => {
  editingId.value = null;
  // Category is optional — start with an empty selection so the
  // operator can decide whether to attach one. We deliberately do
  // NOT auto-fill with the first available category anymore.
  form.value = {
    id: "",
    categoryId: "",
    code: "",
    sku: "",
    name: "",
    sellingPrice: 0,
    costPrice: 0,
    commision: 0,
    isActive: true,
  };
  dialogOpen.value = true;
};

const openEdit = (it: ItemDto): void => {
  editingId.value = it.id;
  form.value = {
    id: it.id,
    categoryId: it.categoryId,
    code: it.code ?? "",
    sku: it.sku ?? "",
    name: it.name,
    sellingPrice: it.sellingPrice,
    costPrice: it.costPrice,
    commision: it.commision ?? 0,
    isActive: it.isActive,
  };
  dialogOpen.value = true;
};

const saveDialog = async (): Promise<void> => {
  if (!isFormValid.value) return;
  const payload: Omit<ItemDto, "id"> = {
    categoryId: form.value.categoryId,
    code: form.value.code ?? "",
    sku: form.value.sku ?? "",
    name: form.value.name.trim(),
    sellingPrice: Number(form.value.sellingPrice) || 0,
    costPrice: Number(form.value.costPrice) || 0,
    commision: Number(form.value.commision) || 0,
    isActive: !!form.value.isActive,
  };
  try {
    if (editingId.value) {
      await store.updateItem(editingId.value, payload);
      $q.notify({ type: "positive", message: "Produk diperbarui." });
    } else {
      await store.createItem(payload);
      $q.notify({ type: "positive", message: "Produk ditambah." });
    }
    dialogOpen.value = false;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    $q.notify({
      type: "negative",
      message: "Gagal menyimpan.",
      caption: message,
    });
  }
};

const confirmDelete = (it: ItemDto): void => {
  $q.dialog({
    title: "Hapus Produk",
    message: `Hapus produk "${it.name}"? Tindakan ini tidak dapat dibatalkan.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      if (!it.id) return;
      try {
        await store.deleteItem(it.id);
        $q.notify({ type: "positive", message: "Produk dihapus." });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        $q.notify({
          type: "negative",
          message: "Gagal menghapus.",
          caption: message,
        });
      }
    })();
  });
};

onMounted(async () => {
  await store.init();
  await onFilterChanged();
});
</script>

<style scoped lang="scss">
.mobile-item-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.empty-state {
  background: white;
  border: 1px dashed #ccc;
  border-radius: 8px;
}
</style>
