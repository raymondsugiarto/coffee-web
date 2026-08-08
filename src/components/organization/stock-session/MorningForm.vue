<template>
  <div class="morning-form">
    <!-- ====== Header ====== -->
    <q-card flat bordered class="q-mb-md bg-blue-1">
      <q-card-section class="q-col-gutter-md q-pa-md">
        <div class="row items-center no-wrap q-mb-sm">
          <q-icon name="wb_sunny" size="22px" color="blue-9" class="q-mr-sm" />
          <div class="text-h6 text-blue-9 text-weight-bold">
            {{ isEditMode ? "Edit Sesi Pagi" : "Morning Session" }}
          </div>
          <q-space />
          <q-chip
            v-if="isEditMode"
            dense
            color="orange-9"
            text-color="white"
            icon="lock_open"
            :label="`Status: ${loadedSession?.status ?? '-'}`"
            class="q-mr-xs"
          />
          <q-chip
            dense
            color="blue-8"
            text-color="white"
            icon="today"
            :label="form.date"
            class="q-mr-none"
          />
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6 col-md-3">
            <q-input
              v-model="form.date"
              outlined
              dense
              label="Tanggal"
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
          </div>
          <div class="col-12 col-sm-6 col-md-9">
            <q-select
              v-model="form.employeeId"
              :options="driverOptions"
              option-value="id"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
              label="Driver (Karyawan)"
              :disable="isEditMode"
              use-input
              input-debounce="300"
              @filter="filterDrivers"
              @update:model-value="onDriverChange"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey"
                    >Tidak ada driver</q-item-section
                  >
                </q-item>
              </template>
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label
                      >{{ scope.opt.firstName }}
                      {{ scope.opt.lastName }}</q-item-label
                    >
                    <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ====== Items ====== -->
    <q-card flat bordered>
      <q-card-section class="row items-center q-py-sm q-px-md">
        <div class="text-subtitle1 text-blue-9 text-weight-medium">
          Produk yang Dibawa
        </div>
        <q-space />
        <q-chip
          color="blue-8"
          text-color="white"
          dense
          icon="inventory_2"
          :label="`${form.items.length} item`"
        />
      </q-card-section>
      <q-separator />

      <!-- Empty state -->
      <div v-if="form.items.length === 0" class="empty-state">
        <q-icon name="shopping_basket" size="56px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-sm">Belum ada produk</div>
        <div class="text-caption text-grey-5">
          Tekan tombol + untuk menambah
        </div>
      </div>

      <!-- Mobile: card list -->
      <div v-else-if="$q.screen.lt.md" class="mobile-item-list">
        <div
          v-for="(it, idx) in form.items"
          :key="it.itemId"
          class="mobile-item-card"
        >
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle2 text-weight-medium ellipsis">
                {{ it.item?.name ?? "-" }}
              </div>
            </div>
            <q-btn
              icon="delete"
              color="negative"
              flat
              round
              dense
              @click="removeItem(idx)"
            />
          </div>
          <div class="row q-col-gutter-sm q-mt-sm items-end item-inputs">
            <div class="col">
              <q-input
                v-model.number="it.outQty"
                type="number"
                dense
                outlined
                label="Out Qty"
                :min="1"
                :class="{ 'qty-invalid': !isOutQtyValid(it) }"
                @update:model-value="recalc"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: q-table -->
      <q-table
        v-else
        :rows="form.items"
        :columns="itemColumns"
        row-key="itemId"
        flat
        dense
        :rows-per-page-options="[0]"
        hide-pagination
      >
        <template #body-cell-outQty="props">
          <q-td :props="props">
            <q-input
              v-model.number="props.row.outQty"
              type="number"
              dense
              outlined
              :min="1"
              :class="{ 'qty-invalid': !isOutQtyValid(props.row) }"
              input-class="text-left"
              style="min-width: 110px"
              @update:model-value="recalc"
            />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              icon="delete"
              color="negative"
              flat
              round
              dense
              @click="removeItem(props.rowIndex)"
            />
          </q-td>
        </template>
      </q-table>

      <q-separator v-if="form.items.length > 0" />
      <q-card-section
        v-if="form.items.length > 0"
        class="row items-center bg-grey-2 q-py-md"
      >
        <div class="text-subtitle1">Total Qty</div>
        <q-space />
        <div class="text-h6 text-blue-9 text-weight-bold">
          {{ totalQty }}
        </div>
      </q-card-section>
    </q-card>

    <!-- ====== Action Footer (responsive) ====== -->
    <div class="action-footer">
      <div class="action-footer-inner">
        <q-btn
          v-if="isEditMode"
          flat
          color="negative"
          icon="delete"
          label="Hapus Sesi"
          no-caps
          :loading="deleting"
          class="action-btn"
          @click="confirmDelete"
        />
        <q-btn
          v-else
          flat
          label="Reset"
          no-caps
          color="grey-8"
          class="action-btn"
          @click="reset"
        />
        <q-btn
          color="primary"
          unelevated
          :icon="isEditMode ? 'save' : 'check'"
          :label="isEditMode ? 'Simpan Perubahan' : 'Buka Sesi'"
          no-caps
          :disable="!canSubmit"
          :loading="submitting"
          class="action-btn"
          @click="submit"
        />
      </div>
      <div v-if="!canSubmit && invalidItemNames.length > 0" class="action-hint">
        <q-icon name="warning" size="16px" color="orange-9" class="q-mr-xs" />
        Qty harus lebih besar dari 0 untuk:
        <span class="text-weight-medium">{{
          invalidItemNames.join(", ")
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { date, useQuasar } from "quasar";
import type { QTableColumn } from "quasar";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import type {
  DriverDto,
  StockSessionDto,
  StockSessionItemInputDto,
} from "./types/stock-session";

type FormItem = StockSessionItemInputDto;

interface ItemRow {
  itemId: string;
  outQty: number;
}

const props = defineProps<{
  /**
   * When provided, the form enters "edit mode": it loads the existing
   * OPEN session and submits via `updateSession` instead of
   * `openSession`. When null/undefined, the form behaves as a fresh
   * "open new session" flow.
   */
  sessionId?: string | null;
}>();

const emit = defineEmits<{
  (e: "saved"): void;
  (e: "deleted"): void;
}>();

const $q = useQuasar();
const store = useStockSessionStore();

const form = reactive({
  employeeId: "",
  date: date.formatDate(new Date(), "YYYY-MM-DD"),
  items: [] as FormItem[],
});

const drivers = ref<DriverDto[]>([]);
const submitting = ref(false);
const deleting = ref(false);
const loadedSession = ref<StockSessionDto | null>(null);

const isEditMode = computed(() => !!props.sessionId && !!loadedSession.value);

const itemColumns: QTableColumn<ItemRow>[] = [
  {
    name: "name",
    label: "Produk",
    field: (r) =>
      form.items.find((i) => i.itemId === r.itemId)?.item?.name ?? "-",
    align: "left",
    sortable: false,
  },
  {
    name: "outQty",
    label: "Out Qty",
    field: "outQty",
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

const driverOptions = computed(() =>
  drivers.value.map((d) => ({
    id: d.id,
    label: `${d.firstName} ${d.lastName}`.trim() || d.email,
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email,
  })),
);

const totalQty = computed(() =>
  form.items.reduce((sum, it) => sum + Math.max(0, Number(it.outQty) || 0), 0),
);

const isOutQtyValid = (it: FormItem): boolean =>
  Number.isInteger(it.outQty) && (it.outQty ?? 0) >= 1;

const invalidItemNames = computed(() =>
  form.items
    .filter((it) => !Number.isInteger(it.outQty) || (it.outQty ?? 0) < 1)
    .map((it) => {
      const found = loadedSession.value?.items.find(
        (i) => i.itemId === it.itemId,
      );
      return found?.item?.name ?? it.itemId;
    }),
);

const canSubmit = computed(
  () =>
    !!form.employeeId &&
    !!form.date &&
    form.items.length > 0 &&
    invalidItemNames.value.length === 0,
);

const filterDrivers = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    void store.fetchDrivers(val).then((res) => {
      drivers.value = res;
    });
  });
};

const onDriverChange = async () => {
  if (!form.employeeId) return;
  const existing = await store.getTodaySession(form.employeeId, form.date);
  if (existing) {
    $q.notify({
      type: "warning",
      message: `Driver ini sudah punya sesi pada ${form.date}.`,
      caption: existing.id,
    });
  }
  await loadItems();
};

// ====== Load items for the selected driver ======
const loadItems = async () => {
  if (!form.employeeId) return;
  await store.fetchItems(form.employeeId, "", {
    session: "MORNING",
  });
  form.items = store.items.map((it) => ({
    itemId: it.id,
    item: it,
    outQty: 0,
    returnQty: 0,
    cashlessSoldQty: 0,
    cashSoldQty: 0,
    soldQty: 0,
  }));
};

const removeItem = (idx: number) => {
  form.items.splice(idx, 1);
};

const reset = (): void => {
  form.employeeId = "";
  form.date = date.formatDate(new Date(), "YYYY-MM-DD");
  form.items = [];
  loadedSession.value = null;
};

defineExpose({ reset });

const recalc = (): void => {
  // No-op for the morning form: subtotal columns are gone, and
  // `outQty` itself is the only numeric input the user edits here.
  // Keeping the function makes the q-input `@update:model-value`
  // binding a single-line change in the parent.
};

// Edit-mode loader
const loadSessionIntoForm = async (id: string): Promise<void> => {
  try {
    const s = await store.getSession(id);
    if (s.status !== "OPEN") {
      $q.notify({
        type: "negative",
        message: `Sesi ini sudah ${s.status === "CLOSED" ? "ditutup" : "tidak dapat diedit"}.`,
      });
      emit("deleted"); // bounce out of edit mode
      return;
    }
    loadedSession.value = s;
    form.employeeId = s.employeeId;
    form.date = s.date;
    form.items = (s.items ?? []).map((it) => ({
      itemId: it.itemId,
      item: it.item,
      outQty: it.outQty,
      returnQty: it.returnQty,
      cashSoldQty: it.cashSoldQty,
      cashlessSoldQty: it.cashlessSoldQty,
      soldQty: it.soldQty,
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    $q.notify({
      type: "negative",
      message: "Gagal memuat sesi untuk diedit.",
      caption: message,
    });
    emit("deleted"); // bounce out
  }
};

// Re-load if the route's sessionId changes (e.g. user navigates
// from one edit button to another).
watch(
  () => props.sessionId,
  async (id) => {
    loadedSession.value = null;
    if (!id) {
      reset();
      return;
    }
    await loadSessionIntoForm(id);
  },
  { immediate: true },
);

const submit = async () => {
  if (!canSubmit.value) {
    $q.notify({
      type: "negative",
      message: "Qty tiap produk harus lebih besar dari 0.",
    });
    return;
  }
  submitting.value = true;
  try {
    const payload = {
      employeeId: form.employeeId,
      date: form.date,
      items: form.items.map((it) => ({
        itemId: it.itemId,
        outQty: it.outQty,
        returnQty: it.returnQty,
        item: it.item,
      })),
    };
    if (isEditMode.value && props.sessionId) {
      await store.updateSession(props.sessionId, payload);
      $q.notify({
        type: "positive",
        message: "Sesi pagi berhasil diperbarui.",
      });
    } else {
      const result = await store.openSession(payload);
      $q.notify({
        type: "positive",
        message: "Sesi pagi berhasil dibuka.",
        caption: result.id,
      });
    }
    emit("saved");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    $q.notify({
      type: "negative",
      message: "Gagal menyimpan sesi.",
      caption: message,
    });
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (): void => {
  if (!props.sessionId) return;
  $q.dialog({
    title: "Hapus Sesi Pagi?",
    message:
      "Tindakan ini tidak dapat dibatalkan. Semua item yang terkait sesi ini akan ikut terhapus.",
    ok: {
      label: "Hapus",
      color: "negative",
      unelevated: true,
      noCaps: true,
    },
    cancel: { label: "Batal", color: "grey-7", flat: true, noCaps: true },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      deleting.value = true;
      try {
        await store.deleteSession(props.sessionId as string);
        $q.notify({
          type: "positive",
          message: "Sesi pagi berhasil dihapus.",
        });
        emit("deleted");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        $q.notify({
          type: "negative",
          message: "Gagal menghapus sesi.",
          caption: message,
        });
      } finally {
        deleting.value = false;
      }
    })();
  });
};

onMounted(async () => {
  drivers.value = await store.fetchDrivers();
});
</script>

<style scoped lang="scss">
.morning-form {
  // leave room on mobile so the sticky footer doesn't cover content
  padding-bottom: 96px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #9e9e9e;
}

// ----- Mobile item card list -----
.mobile-item-list {
  display: flex;
  flex-direction: column;
}

.mobile-item-card {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

// ----- Responsive action footer -----
.action-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
  margin-top: 16px;
}

.action-footer-inner {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  max-width: 1280px;
  margin: 0 auto;
  align-items: stretch;
}

.action-btn {
  flex: 1 1 0;
  min-height: 44px;
  font-size: 14px;
}

// On larger screens the footer is inline
@media (min-width: 600px) {
  .morning-form {
    padding-bottom: 16px;
  }

  .action-footer {
    position: static;
    background: transparent;
    border-top: none;
    box-shadow: none;
  }

  .action-btn {
    flex: 0 0 auto;
    min-width: 140px;
  }
}

// Larger numeric inputs on mobile
@media (max-width: 599px) {
  :deep(.q-field--dense .q-field__native),
  :deep(.q-field--dense .q-field__input) {
    font-size: 16px; // avoids iOS zoom on focus
  }
}

.action-hint {
  font-size: 12px;
  color: #b26a00;
  background: #fff8e1;
  border-top: 1px solid #ffe0b2;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-wrap: wrap;
  gap: 2px;
}

// ----- Item row input alignment (desktop table + mobile cards) -----
:deep(.q-table td .q-field--dense .q-field__control),
:deep(.mobile-item-card .q-field--dense .q-field__control) {
  min-height: 36px;
  padding-left: 8px;
  padding-right: 8px;
}

:deep(.q-table td .q-field--dense .q-field__input),
:deep(.mobile-item-card .q-field--dense .q-field__input) {
  padding: 4px 0;
}

.item-inputs {
  align-items: flex-end !important;
}

.item-inputs > div > .q-field--dense,
.item-inputs > div > .q-field--dense .q-field__control {
  min-height: 36px;
}

// Error indication for Out Qty without reserving message space.
.qty-invalid :deep(.q-field__control) {
  box-shadow: inset 0 0 0 1px var(--q-negative, #c10015) !important;
}
</style>
