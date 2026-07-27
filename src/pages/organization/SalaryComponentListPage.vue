<template>
  <q-page
    :padding="$q.screen.gt.xs ? true : false"
    class="salary-component-list-page"
  >
    <!-- ====== Header ====== -->
    <div class="row items-center q-mb-md q-px-sm q-px-md-none">
      <q-btn flat round icon="arrow_back" :to="{ name: 'dashboard' }" />
      <div class="text-h6 text-h5-sm text-weight-bold q-ml-sm">
        Komponen Gaji
      </div>
      <q-space />
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Tambah Komponen"
        no-caps
        @click="openCreate"
      >
        <q-tooltip v-if="$q.screen.xs" anchor="top middle" self="bottom middle">
          Tambah Komponen
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
                v-model="filterCompany"
                outlined
                dense
                label="Company ID"
                clearable
                debounce="300"
                @update:model-value="onFilterChanged"
              >
                <template #prepend>
                  <q-icon name="business" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="filterType"
                :options="typeOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                label="Tipe Komponen"
                clearable
                @update:model-value="onFilterChanged"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ====== Mobile card list ====== -->
      <div v-if="$q.screen.lt.md" class="mobile-component-list">
        <div
          v-if="components.length === 0"
          class="empty-state text-center q-pa-xl"
        >
          <q-icon name="payments" size="56px" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-sm">Belum ada komponen gaji</div>
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
        <div v-for="c in components" :key="c.id" class="mobile-component-card">
          <div class="row items-center">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">
                {{ typeLabel(c.componentType) }}
              </div>
              <div class="text-caption text-grey-7">
                Company: {{ c.companyId }}
              </div>
              <div class="row q-mt-xs q-gutter-sm items-center">
                <q-chip
                  color="indigo-8"
                  text-color="white"
                  dense
                  size="sm"
                  icon="flag"
                  :label="`Target ${formatAmount(c.minimumTarget)}`"
                />
                <div class="text-subtitle2 text-weight-bold text-positive">
                  Rp {{ formatAmount(c.amount) }}
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
          :rows="components"
          :columns="columns"
          row-key="id"
          flat
          dense
          :loading="loading"
          :rows-per-page-options="[10, 25, 50]"
        >
          <template #body-cell-componentType="props">
            <q-td :props="props">
              <q-chip
                :color="typeColor(props.row.componentType)"
                text-color="white"
                dense
                size="sm"
                :label="typeLabel(props.row.componentType)"
              />
            </q-td>
          </template>
          <template #body-cell-minimumTarget="props">
            <q-td :props="props" class="text-right">
              {{ formatAmount(props.row.minimumTarget) }}
            </q-td>
          </template>
          <template #body-cell-amount="props">
            <q-td :props="props" class="text-right text-weight-bold">
              Rp {{ formatAmount(props.row.amount) }}
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
              <q-icon name="payments" size="48px" color="grey-5" />
              <div class="text-h6 q-mt-sm">Belum ada komponen gaji</div>
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
            {{ editingId ? "Edit Komponen" : "Tambah Komponen" }}
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <SelectCompany
            v-model="form.company"
            label="Company *"
            :rules="[(v: unknown) => !!v || 'Company wajib dipilih']"
          />
          <q-select
            v-model="form.componentType"
            :options="typeOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
            label="Tipe Komponen *"
            :rules="[(v) => !!v || 'Tipe wajib diisi']"
          />
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="form.minimumTarget"
                type="number"
                outlined
                dense
                label="Minimum Target"
                hint="Contoh: 27 hari kerja, 30 penjualan"
                min="0"
                :rules="[(v) => Number(v) >= 0 || 'Target tidak valid']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="form.amount"
                type="number"
                outlined
                dense
                label="Nominal (Rp) *"
                min="0"
                :rules="[(v) => Number(v) >= 0 || 'Nominal tidak valid']"
              />
            </div>
          </div>
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
import { useSalaryComponentStore } from "@/stores/salary-component/salary-component-store";
import SelectCompany from "@/components/organization/company/SelectCompany.vue";
import type {
  SalaryComponentDto,
  SalaryComponentType,
} from "@/components/organization/salary-component/types/salary-component";
import type { CompanyResponse } from "@/components/organization/company/types/company";
import type { QSelectValue } from "@/types/components/tselect";

const $q = useQuasar();
const store = useSalaryComponentStore();

const filterCompany = ref("");
const filterType = ref<SalaryComponentType | null>(null);
const loading = ref(false);

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
// `id` is required by the DTO type but only meaningful in edit mode;
// we leave it as an empty string while creating. `company` carries
// the full SelectCompany value (with .object for backend payload
// extraction); the wire-level `companyId` is derived at save time.
const form = ref<
  SalaryComponentDto & { company?: QSelectValue<CompanyResponse> | undefined }
>({
  id: "",
  companyId: "",
  componentType: "MEAL_ALLOWANCE",
  minimumTarget: 0,
  amount: 0,
});

const components = computed<SalaryComponentDto[]>(() => store.components);

// Enum options shown in the dropdown. The label is human-readable
// Indonesian; the value is the Go enum constant.
const typeOptions: { value: SalaryComponentType; label: string }[] = [
  { value: "MEAL_ALLOWANCE", label: "Uang Makan" },
  { value: "ATTENDANCE", label: "Bonus Kehadiran" },
  { value: "BONUS_TARGET", label: "Bonus Target" },
];

const typeLabel = (t: SalaryComponentType): string =>
  typeOptions.find((o) => o.value === t)?.label ?? t;

const typeColor = (t: SalaryComponentType): string => {
  switch (t) {
    case "MEAL_ALLOWANCE":
      return "orange-8";
    case "ATTENDANCE":
      return "blue-8";
    case "BONUS_TARGET":
      return "green-8";
    default:
      return "grey-7";
  }
};

const formatAmount = (n: number): string =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n ?? 0);

interface ComponentRow {
  id: string;
  companyId: string;
  componentType: SalaryComponentType;
  minimumTarget: number;
  amount: number;
}

const columns: QTableColumn<ComponentRow>[] = [
  {
    name: "companyId",
    label: "Company",
    field: "companyId",
    align: "left",
    sortable: true,
  },
  {
    name: "componentType",
    label: "Tipe",
    field: "componentType",
    align: "left",
    sortable: true,
  },
  {
    name: "minimumTarget",
    label: "Min. Target",
    field: "minimumTarget",
    align: "right",
    sortable: true,
  },
  {
    name: "amount",
    label: "Nominal",
    field: "amount",
    align: "right",
    sortable: true,
  },
  {
    name: "actions",
    label: "",
    field: () => "",
    align: "right",
    sortable: false,
  },
];

const isFormValid = computed(
  () =>
    !!form.value.company?.value &&
    !!form.value.componentType &&
    Number(form.value.amount) >= 0,
);

const onFilterChanged = async (): Promise<void> => {
  loading.value = true;
  try {
    // Build the query conditionally so we never pass `undefined`
    // to fields declared with `exactOptionalPropertyTypes: true`.
    const query: {
      companyId: string;
      componentType?: SalaryComponentType;
    } = { companyId: filterCompany.value ?? "" };
    if (filterType.value) {
      query.componentType = filterType.value;
    }
    await store.fetch(query);
  } finally {
    loading.value = false;
  }
};

const resetFilter = async (): Promise<void> => {
  filterCompany.value = "";
  filterType.value = null;
  await onFilterChanged();
};

const openCreate = (): void => {
  editingId.value = null;
  form.value = {
    id: "",
    companyId: "",
    company: undefined,
    componentType: "MEAL_ALLOWANCE",
    minimumTarget: 0,
    amount: 0,
  };
  dialogOpen.value = true;
};

const openEdit = (c: SalaryComponentDto): void => {
  editingId.value = c.id;
  // On edit, the stored `companyId` may not be enough to look the
  // company up via SelectCompany (which expects a full object).
  // Leave `company` undefined; user can re-select if they want to
  // change the binding. companyId (the persisted wire field) is
  // still kept so the save payload is complete.
  form.value = {
    id: c.id,
    companyId: c.companyId,
    company: undefined,
    componentType: c.componentType,
    minimumTarget: c.minimumTarget,
    amount: c.amount,
  };
  dialogOpen.value = true;
};

const saveDialog = async (): Promise<void> => {
  if (!isFormValid.value) return;
  // Resolve the persisted companyId from the SelectCompany value.
  // On create, the user must have selected a company. On edit, we
  // fall back to the previously-saved companyId so the binding
  // stays intact when the user doesn't change the dropdown.
  const pickedId = form.value.company?.value?.trim() || "";
  const companyId = pickedId || form.value.companyId;
  const payload: Omit<SalaryComponentDto, "id"> = {
    companyId,
    componentType: form.value.componentType,
    minimumTarget: Number(form.value.minimumTarget) || 0,
    amount: Number(form.value.amount) || 0,
  };
  try {
    if (editingId.value) {
      await store.update(editingId.value, payload);
      $q.notify({ type: "positive", message: "Komponen diperbarui." });
    } else {
      await store.create(payload);
      $q.notify({ type: "positive", message: "Komponen ditambah." });
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

const confirmDelete = (c: SalaryComponentDto): void => {
  $q.dialog({
    title: "Hapus Komponen",
    message: `Hapus komponen "${typeLabel(c.componentType)}" untuk company "${c.companyId}"? Tindakan ini tidak dapat dibatalkan.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await store.delete(c.id);
        $q.notify({ type: "positive", message: "Komponen dihapus." });
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
.mobile-component-card {
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
