<template>
  <q-page :padding="$q.screen.gt.xs ? true : false" class="cash-debt-list-page">
    <!-- ====== Header ====== -->
    <div class="row items-center q-mb-md q-px-sm q-px-md-none">
      <q-btn flat round icon="arrow_back" :to="{ name: 'dashboard' }" />
      <div class="text-h6 text-h5-sm text-weight-bold q-ml-sm">Cash Debt</div>
      <q-space />
      <q-btn
        unelevated
        color="primary"
        icon="add"
        label="Tambah Cash Debt"
        no-caps
        @click="openCreate"
      >
        <q-tooltip v-if="$q.screen.xs" anchor="top middle" self="bottom middle">
          Tambah Cash Debt
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
            <div class="col-12 col-md-4">
              <SelectEmployee v-model="filterEmployee" />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="filterFrom"
                outlined
                dense
                label="Dari Tanggal"
                mask="####-##-##"
                readonly
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="filterFrom" mask="YYYY-MM-DD" minimal />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="filterTo"
                outlined
                dense
                label="Sampai Tanggal"
                mask="####-##-##"
                readonly
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="filterTo" mask="YYYY-MM-DD" minimal />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-2">
              <q-select
                v-model="filterMethod"
                :options="methodOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                label="Metode"
                clearable
                @update:model-value="onFilterChanged"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ====== Mobile card list ====== -->
      <div v-if="$q.screen.lt.md" class="cash-debt-mobile-list">
        <div
          v-if="store.items.length === 0"
          class="empty-state text-center q-pa-xl"
        >
          <q-icon name="request_quote" size="56px" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-sm">Belum ada cash debt</div>
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
        <div v-for="d in store.items" :key="d.id" class="mobile-debt-card">
          <div class="row items-center">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">
                {{ employeeLabelFor(d.adminIdEmployee) }}
              </div>
              <div class="text-caption text-grey-7">{{ d.date }}</div>
              <div class="row q-mt-xs q-gutter-sm items-center">
                <q-chip
                  :color="methodColor(d.paymentMethod)"
                  text-color="white"
                  dense
                  size="sm"
                  :label="methodLabel(d.paymentMethod)"
                />
                <div class="text-subtitle2 text-weight-bold text-positive">
                  Rp {{ formatAmount(d.amount) }}
                </div>
              </div>
              <div v-if="d.notes" class="text-caption text-grey-7 q-mt-xs">
                {{ d.notes }}
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                @click="openEdit(d)"
              />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmDelete(d)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ====== Desktop table ====== -->
      <q-card v-else flat bordered>
        <q-table
          :rows="store.items"
          :columns="columns"
          row-key="id"
          flat
          dense
          :rows-per-page-options="[10, 25, 50]"
        >
          <template #body-cell-adminIdEmployee="props">
            <q-td :props="props">
              {{ employeeLabelFor(props.row.adminIdEmployee) }}
            </q-td>
          </template>
          <template #body-cell-date="props">
            <q-td :props="props">{{ props.row.date }}</q-td>
          </template>
          <template #body-cell-paymentMethod="props">
            <q-td :props="props">
              <q-chip
                :color="methodColor(props.row.paymentMethod)"
                text-color="white"
                dense
                size="sm"
                :label="methodLabel(props.row.paymentMethod)"
              />
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
        </q-table>
      </q-card>
    </div>

    <!-- ====== Form dialog ====== -->
    <q-dialog v-model="dialogOpen" persistent full-width>
      <q-card style="max-width: 640px">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon
            :name="editingId ? 'edit' : 'add'"
            size="22px"
            class="q-mr-sm"
          />
          <div class="text-h6">
            {{ editingId ? "Edit Cash Debt" : "Tambah Cash Debt" }}
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <SelectEmployee
            v-model="form.employee"
            label="Driver *"
            :rules="[(v: unknown) => !!v || 'Driver wajib dipilih']"
          />
          <q-input
            v-model="form.date"
            outlined
            dense
            label="Tanggal *"
            mask="####-##-##"
            readonly
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="form.date" mask="YYYY-MM-DD" minimal />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            v-model.number="form.amount"
            type="number"
            outlined
            dense
            label="Nominal (Rp) *"
            min="0"
            step="1000"
            :rules="[(v) => Number(v) >= 0 || 'Nominal tidak valid']"
          />
          <q-select
            v-model="form.paymentMethod"
            :options="methodOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
            label="Metode Pembayaran *"
            :rules="[(v) => !!v || 'Metode wajib dipilih']"
          />
          <q-input
            v-model="form.notes"
            type="textarea"
            outlined
            autogrow
            label="Catatan (opsional)"
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
            :disable="!isFormValid"
            @click="saveDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { date, useQuasar, type QTableColumn } from "quasar";
import { useCashDebtStore } from "@/stores/cash-debt/cash-debt-store";
import SelectEmployee from "@/components/organization/employee/SelectEmployee.vue";
import type {
  CashDebtDto,
  CashDebtPaymentMethod,
} from "@/components/organization/cash_debt/types/cash-debt";
import type { QSelectValue } from "@/types/components/tselect";
import type { EmployeeResponse } from "@/components/organization/employee/types/employee";

const $q = useQuasar();
const store = useCashDebtStore();

const today = date.formatDate(new Date(), "YYYY-MM-DD");
const monthAgo = date.formatDate(
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  "YYYY-MM-DD",
);

// Filter state — bound to the SelectEmployee component for the
// driver filter so the page matches the PickCompany/PickDriver
// UX used elsewhere in the app.
const filterEmployee = ref<QSelectValue<EmployeeResponse> | undefined>(
  undefined,
);
const filterFrom = ref(monthAgo);
const filterTo = ref(today);
const filterMethod = ref<CashDebtPaymentMethod | null>(null);

const methodOptions = [
  { value: "CASH", label: "Cash (uang fisik)" },
  { value: "CASHLESS", label: "Cashless (QRIS / Transfer)" },
];

const methodLabel = (m: string): string =>
  m === "CASH" ? "Cash (uang fisik)" : "Cashless (QRIS / Transfer)";
const methodColor = (m: string): string => (m === "CASH" ? "positive" : "info");

const onFilterChanged = () => {
  void reload();
};

const resetFilter = () => {
  filterEmployee.value = undefined;
  filterFrom.value = monthAgo;
  filterTo.value = today;
  filterMethod.value = null;
  void reload();
};

const reload = () => {
  return store.fetch({
    page: 0,
    size: 200,
    adminIdEmployee: filterEmployee.value?.value,
    from: filterFrom.value || undefined,
    to: filterTo.value || undefined,
    paymentMethod: filterMethod.value ?? undefined,
  });
};

watch(
  () => [filterFrom.value, filterTo.value],
  () => {
    void reload();
  },
);

// Re-fetch when the employee filter changes (SelectEmployee
// emits update on selection).
watch(
  () => filterEmployee.value,
  () => {
    void reload();
  },
);

const employeeLabelFor = (id: string): string => {
  if (filterEmployee.value?.value === id) {
    const e = filterEmployee.value.object;
    if (e) {
      return `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || e.email || id;
    }
  }
  // The list endpoint doesn't hydrate the employee; fall back to id.
  return id;
};

const columns: QTableColumn<CashDebtDto>[] = [
  {
    name: "adminIdEmployee",
    label: "Driver",
    field: "adminIdEmployee",
    align: "left",
    sortable: false,
  },
  {
    name: "date",
    label: "Tanggal",
    field: "date",
    align: "left",
    sortable: true,
  },
  {
    name: "paymentMethod",
    label: "Metode",
    field: "paymentMethod",
    align: "left",
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
    name: "notes",
    label: "Catatan",
    field: "notes",
    align: "left",
    sortable: false,
  },
  {
    name: "actions",
    label: "",
    field: "id",
    align: "right",
    sortable: false,
  },
];

// ====== Form dialog ======

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);

interface FormState {
  employee: QSelectValue<EmployeeResponse> | undefined;
  date: string;
  amount: number;
  paymentMethod: CashDebtPaymentMethod | null;
  notes: string;
}
const form = reactive<FormState>({
  employee: undefined,
  date: today,
  amount: 0,
  paymentMethod: "CASH",
  notes: "",
});

const resetForm = () => {
  form.employee = undefined;
  form.date = today;
  form.amount = 0;
  form.paymentMethod = "CASH";
  form.notes = "";
};

const openCreate = () => {
  resetForm();
  editingId.value = null;
  dialogOpen.value = true;
};

const openEdit = (row: CashDebtDto) => {
  editingId.value = row.id;
  form.date = row.date;
  form.amount = row.amount;
  form.paymentMethod = row.paymentMethod;
  form.notes = row.notes;
  // The list endpoint does not hydrate the employee; we keep
  // the form.employee ref empty but the wire payload below uses
  // the row's adminIdEmployee. After save, the page refetches
  // and the row's id stays the same.
  form.employee = undefined;
  dialogOpen.value = true;
};

const isFormValid = computed(
  () =>
    !!form.date &&
    form.amount >= 0 &&
    !!form.paymentMethod &&
    // Driver must be selected on create. On edit the dialog is
    // technically pre-filled from the row, but we still require
    // it so the user can change ownership.
    (!!editingId.value || !!form.employee?.value) &&
    !!form.employee?.value,
);

const formatAmount = (n: number): string =>
  new Intl.NumberFormat("id-ID").format(n);

const saveDialog = async (): Promise<void> => {
  if (!isFormValid.value) return;
  if (!form.employee?.value) return;
  const payload = {
    adminIdEmployee: form.employee.value,
    date: form.date,
    amount: form.amount,
    paymentMethod: form.paymentMethod ?? "CASH",
    notes: form.notes,
  };
  try {
    if (editingId.value) {
      await store.update(editingId.value, payload);
    } else {
      await store.create(payload);
    }
    dialogOpen.value = false;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    $q.notify({
      type: "negative",
      message: "Gagal menyimpan",
      caption: message,
    });
  }
};

const confirmDelete = (row: CashDebtDto): void => {
  $q.dialog({
    title: "Hapus Cash Debt",
    message: `Hapus entry cash debt untuk ${employeeLabelFor(row.adminIdEmployee)} pada ${row.date}?`,
    cancel: true,
    persistent: true,
    ok: { color: "negative", label: "Hapus", noCaps: true },
  }).onOk(() => {
    void (async () => {
      try {
        await store.delete(row.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        $q.notify({
          type: "negative",
          message: "Gagal menghapus",
          caption: message,
        });
      }
    })();
  });
};

onMounted(() => {
  void reload();
});
</script>
