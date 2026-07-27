<template>
  <q-page
    :padding="$q.screen.gt.xs ? true : false"
    class="item-category-list-page"
  >
    <!-- ====== Header ====== -->
    <div class="row items-center q-mb-md q-px-sm q-px-md-none">
      <q-btn flat round icon="arrow_back" :to="{ name: 'dashboard' }" />
      <div class="text-h6 text-h5-sm text-weight-bold q-ml-sm">
        Kategori Produk
      </div>
      <q-space />
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Tambah Kategori"
        no-caps
        @click="openCreate"
      >
        <q-tooltip v-if="$q.screen.xs" anchor="top middle" self="bottom middle">
          Tambah Kategori
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
          <q-input
            v-model="filterQuery"
            outlined
            dense
            label="Cari nama kategori"
            clearable
            debounce="300"
            @update:model-value="onFilterChanged"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <!-- ====== Mobile card list ====== -->
      <div v-if="$q.screen.lt.md" class="mobile-category-list">
        <div
          v-if="categories.length === 0"
          class="empty-state text-center q-pa-xl"
        >
          <q-icon name="category" size="56px" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-sm">Belum ada kategori</div>
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
        <div v-for="c in categories" :key="c.id" class="mobile-category-card">
          <div class="row items-center">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">{{ c.name }}</div>
              <div class="text-caption text-grey-7">{{ c.id }}</div>
            </div>
            <div class="col-auto">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                @click="openEdit(c)"
              />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmDelete(c)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ====== Desktop table ====== -->
      <q-card v-else flat bordered>
        <q-table
          :rows="categories"
          :columns="columns"
          row-key="id"
          flat
          dense
          :loading="loading"
          :rows-per-page-options="[10, 25, 50]"
        >
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
              <q-icon name="category" size="48px" color="grey-5" />
              <div class="text-h6 q-mt-sm">Belum ada kategori</div>
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
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 320px; max-width: 480px">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon
            :name="editingId ? 'edit' : 'add'"
            size="22px"
            class="q-mr-sm"
          />
          <div class="text-h6">
            {{ editingId ? "Edit Kategori" : "Tambah Kategori" }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="form.name"
            outlined
            dense
            label="Nama Kategori"
            autofocus
            :rules="[(v) => !!(v && v.trim().length > 0) || 'Nama wajib diisi']"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Batal" no-caps v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="editingId ? 'Simpan' : 'Tambah'"
            no-caps
            :loading="store.submitting"
            :disable="!form.name?.trim()"
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
import type { ItemCategoryDto } from "@/components/organization/stock-session/types/stock-session";

const $q = useQuasar();
const store = useCatalogStore();

const filterQuery = ref("");
const loading = ref(false);

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
const form = ref<ItemCategoryDto>({ id: "", name: "" });

const categories = computed<ItemCategoryDto[]>(() => store.categories);

interface CategoryRow {
  id: string;
  name: string;
}

const columns: QTableColumn<CategoryRow>[] = [
  {
    name: "name",
    label: "Nama",
    field: "name",
    align: "left",
    sortable: true,
  },
  {
    name: "id",
    label: "ID",
    field: "id",
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

const onFilterChanged = async (): Promise<void> => {
  loading.value = true;
  try {
    await store.fetchCategories({ query: filterQuery.value ?? "" });
  } finally {
    loading.value = false;
  }
};

const resetFilter = async (): Promise<void> => {
  filterQuery.value = "";
  await onFilterChanged();
};

const openCreate = (): void => {
  editingId.value = null;
  form.value = { id: "", name: "" };
  dialogOpen.value = true;
};

const openEdit = (c: ItemCategoryDto): void => {
  editingId.value = c.id;
  form.value = { id: c.id, name: c.name };
  dialogOpen.value = true;
};

const saveDialog = async (): Promise<void> => {
  if (!form.value.name?.trim()) return;
  try {
    if (editingId.value) {
      await store.updateCategory(editingId.value, {
        name: form.value.name.trim(),
      });
      $q.notify({ type: "positive", message: "Kategori diperbarui." });
    } else {
      await store.createCategory({ name: form.value.name.trim() });
      $q.notify({ type: "positive", message: "Kategori ditambah." });
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

const confirmDelete = (c: ItemCategoryDto): void => {
  $q.dialog({
    title: "Hapus Kategori",
    message: `Hapus kategori "${c.name}"? Tindakan ini tidak dapat dibatalkan.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await store.deleteCategory(c.id);
        $q.notify({ type: "positive", message: "Kategori dihapus." });
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
  await onFilterChanged();
});
</script>

<style scoped lang="scss">
.mobile-category-card {
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
