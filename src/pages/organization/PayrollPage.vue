<template>
  <q-page :padding="$q.screen.gt.xs ? true : false" class="payroll-page">
    <!-- ====== Header ====== -->
    <div class="row items-center q-mb-md q-px-sm q-px-md-none">
      <q-btn flat round icon="arrow_back" :to="{ name: 'dashboard' }" />
      <div class="text-h6 text-h5-sm text-weight-bold q-ml-sm">Payroll</div>
    </div>

    <div class="q-px-sm q-px-md-none">
      <!-- ====== Simulation form ====== -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Simulasi</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <SelectEmployee v-model="form.employee" />
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.startDate"
                outlined
                dense
                label="Tanggal Mulai"
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
                      <q-date
                        v-model="form.startDate"
                        mask="YYYY-MM-DD"
                        minimal
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="form.endDate"
                outlined
                dense
                label="Tanggal Selesai"
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
                      <q-date
                        v-model="form.endDate"
                        mask="YYYY-MM-DD"
                        minimal
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-2 row items-center justify-end">
              <q-btn
                class="full-width"
                unelevated
                color="primary"
                icon="play_arrow"
                label="Simulasi"
                no-caps
                :loading="store.submitting"
                @click="runSimulate"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ====== Simulation result ====== -->
      <q-card v-if="simulation" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            Hasil Simulasi ({{ simulation.sessionCount }} sesi)
          </div>

          <!-- summary boxes -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6 col-md-3 col-lg-2">
              <SummaryBox
                label="Meal Allowance"
                :value="formatCurrency(simulation.totalMealAllowance)"
                color="green"
              />
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <SummaryBox
                label="Komisi"
                :value="formatCurrency(simulation.totalCommission)"
                color="blue"
              />
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <SummaryBox
                label="Bonus Target"
                :value="formatCurrency(simulation.totalBonusTarget)"
                color="purple"
              />
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <SummaryBox
                label="Bonus Hadir"
                :value="formatCurrency(simulation.totalAttendanceAllowance)"
                color="orange"
              />
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <SummaryBox
                label="Total Gaji"
                :value="formatCurrency(simulation.totalSalary)"
                color="purple"
              />
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <SummaryBox
                label="Cash Debt"
                :value="formatCurrency(simulation.totalCashDebt)"
                color="red"
              />
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <SummaryBox
                label="Sisa (Cash Receipt belum diisi)"
                :value="formatCurrency(simulation.remainingSalary)"
                color="green"
              />
            </div>
          </div>

          <!-- per-session table -->
          <q-table
            :rows="simulation.sessions"
            :columns="sessionColumns"
            row-key="sessionId"
            flat
            dense
            :rows-per-page-options="[0]"
            hide-pagination
          >
            <template #body-cell-totalSales="props">
              <q-td :props="props" class="text-right">
                {{ formatCurrency(props.row.totalSales) }}
              </q-td>
            </template>
            <template #body-cell-mealAllowance="props">
              <q-td :props="props" class="text-right">
                {{ formatCurrency(props.row.mealAllowance) }}
              </q-td>
            </template>
            <template #body-cell-attendance="props">
              <q-td :props="props" class="text-right">
                {{ formatCurrency(props.row.attendance) }}
              </q-td>
            </template>
            <template #body-cell-commission="props">
              <q-td :props="props" class="text-right">
                {{ formatCurrency(props.row.commission) }}
              </q-td>
            </template>
            <template #body-cell-bonusTarget="props">
              <q-td :props="props" class="text-right">
                {{ formatCurrency(props.row.bonusTarget) }}
              </q-td>
            </template>
            <template #body-cell-totalSalary="props">
              <q-td
                :props="props"
                class="text-right text-weight-bold text-orange-9"
              >
                {{ formatCurrency(props.row.totalSalary) }}
              </q-td>
            </template>
            <!--
              Cash Debt chip: shows the rolled debt amount for the
              session's date (0 if no rows). Clicking opens a
              dialog that lists every cash_debt row attached to
              this session's date so the operator can audit which
              advance is being netted into the remaining salary.
            -->
            <template #body-cell-cashDebts="props">
              <q-td :props="props" class="text-right">
                <q-btn
                  v-if="cashDebtTotalFor(props.row) > 0"
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="deep-orange-9"
                  :label="`${formatCurrency(cashDebtTotalFor(props.row))}`"
                  :icon-right="
                    props.row.cashDebts.length > 1
                      ? 'keyboard_arrow_down'
                      : undefined
                  "
                  @click="openCashDebtDialog(props.row)"
                >
                  <q-tooltip v-if="props.row.cashDebts.length > 1">
                    {{ props.row.cashDebts.length }} entri cash debt - klik
                    untuk detail
                  </q-tooltip>
                </q-btn>
                <span v-else class="text-grey-5">-</span>
              </q-td>
            </template>
            <!--
              Footer row: per-column sum of the session table.
              Mirrors the SummaryBox values above so the operator
              can verify the rolled totals at a glance.
            -->
            <template #bottom-row>
              <q-tr class="bg-grey-2 text-weight-bold">
                <q-td class="text-left"
                  >Total ({{ simulation.sessionCount }} sesi)</q-td
                >
                <q-td />
                <q-td class="text-right">
                  {{ formatCurrency(sessionTotals.totalSales) }}
                </q-td>
                <q-td class="text-right">
                  {{ formatCurrency(sessionTotals.mealAllowance) }}
                </q-td>
                <q-td class="text-right">
                  {{ formatCurrency(sessionTotals.totalAttendance) }}
                </q-td>
                <q-td class="text-right">
                  {{ formatCurrency(sessionTotals.commission) }}
                </q-td>

                <q-td class="text-right">
                  {{ formatCurrency(sessionTotals.bonusTarget) }}
                </q-td>
                <q-td class="text-right text-orange-9">
                  {{ formatCurrency(sessionTotals.totalSalary) }}
                </q-td>
                <q-td class="text-right text-deep-orange-9">
                  {{ formatCurrency(sessionTotals.cashDebt) }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>

        <!-- ====== Cash Debt detail dialog ====== -->
        <q-dialog v-model="cashDebtDialogOpen">
          <q-card style="min-width: 320px; max-width: 600px; width: 100%">
            <q-card-section class="row items-center q-gutter-sm">
              <q-icon name="request_quote" color="deep-orange-9" size="28px" />
              <div>
                <div class="text-h6 text-weight-bold">
                  Cash Debt — {{ cashDebtDialogSession?.date ?? "" }}
                </div>
                <div class="text-caption text-grey-7">
                  {{ cashDebtDialogSession?.cashDebts?.length ?? 0 }} entri pada
                  tanggal ini
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section v-if="!cashDebtDialogSession?.cashDebts?.length">
              <div class="text-grey-6 text-center q-pa-md">
                Tidak ada cash debt pada tanggal ini.
              </div>
            </q-card-section>
            <q-list v-else separator>
              <q-item
                v-for="d in cashDebtDialogSession?.cashDebts ?? []"
                :key="d.id"
              >
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ formatCurrency(d.amount) }}
                    <q-badge
                      :color="d.paymentMethod === 'CASH' ? 'green' : 'blue'"
                      class="q-ml-sm"
                    >
                      {{ d.paymentMethod }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label v-if="d.notes" caption class="text-grey-7">
                    {{ d.notes }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption class="text-grey-7">
                    {{ d.date }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item class="bg-grey-2">
                <q-item-section>
                  <q-item-label class="text-weight-bold text-deep-orange-9">
                    Total
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold text-deep-orange-9">
                    {{
                      formatCurrency(cashDebtTotalFor(cashDebtDialogSession))
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-actions align="right">
              <q-btn flat label="Tutup" no-caps v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            unelevated
            color="primary"
            icon="save"
            label="Simpan Payroll"
            no-caps
            :loading="store.submitting"
            :disable="simulation.sessionCount === 0"
            @click="openSaveDialog"
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- ====== Save dialog ====== -->
    <q-dialog v-model="saveDialogOpen">
      <q-card style="min-width: 360px; max-width: 480px">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Konfirmasi Cash Receipt</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Masukkan nominal cash receipt yang sudah diterima karyawan. Sisa
            gaji akan dihitung otomatis.
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model.number="cashReceipt"
            type="number"
            outlined
            dense
            label="Total Cash Receipt"
            min="0"
            step="1000"
          />
          <div class="q-mt-md text-subtitle2">
            Total Gaji:
            <span class="text-orange-9 text-weight-bold">
              {{ formatCurrency(simulation?.totalSalary ?? 0) }}
            </span>
          </div>
          <div class="text-subtitle2">
            Cash Debt:
            <span class="text-deep-orange-9 text-weight-bold">
              {{ formatCurrency(simulation?.totalCashDebt ?? 0) }}
            </span>
          </div>
          <div class="text-subtitle2">
            Sisa:
            <span class="text-weight-bold">
              {{
                formatCurrency(
                  (simulation?.totalSalary ?? 0) -
                    (cashReceipt ?? 0) -
                    (simulation?.totalCashDebt ?? 0),
                )
              }}
            </span>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Batal" no-caps v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Simpan"
            no-caps
            :loading="store.submitting"
            @click="confirmSave"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ====== Success dialog ====== -->
    <q-dialog v-model="successDialogOpen">
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center q-gutter-sm">
          <q-icon name="check_circle" size="36px" color="positive" />
          <div>
            <div class="text-h6 text-weight-bold">Payroll Tersimpan</div>
            <div class="text-caption text-grey-7">
              Payroll untuk {{ savedEmployeeLabel }} ({{ savedRange }}) berhasil
              disimpan.
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            unelevated
            color="primary"
            label="OK"
            no-caps
            v-close-popup
            @click="onSuccessClose"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { date } from "quasar";
import type { QTableColumn } from "quasar";
import { useQuasar } from "quasar";
import { usePayrollStore } from "@/stores/payroll/payroll-store";
import SelectEmployee from "@/components/organization/employee/SelectEmployee.vue";
import SummaryBox from "@/components/organization/stock-session/SummaryBox.vue";
import { formatCurrency } from "@/composables/format";
import type {
  EmployeeSalaryComponentDto,
  SimulatePayrollResultDto,
  SimulatePayrollSessionDto,
} from "@/components/organization/payroll/types/payroll";
import type { QSelectValue } from "@/types/components/tselect";
import type { EmployeeResponse } from "@/components/organization/employee/types/employee";

const store = usePayrollStore();
const $q = useQuasar();

const today = date.formatDate(new Date(), "YYYY-MM-DD");
const monthStart = date.formatDate(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  "YYYY-MM-DD",
);

interface FormState {
  employee: QSelectValue<EmployeeResponse> | undefined;
  startDate: string;
  endDate: string;
}
const form = reactive<FormState>({
  employee: undefined,
  startDate: monthStart,
  endDate: today,
});

const simulation = ref<SimulatePayrollResultDto | null>(null);
const saveDialogOpen = ref(false);
const successDialogOpen = ref(false);
const cashReceipt = ref<number>(0);
const savedEmployeeLabel = ref<string>("");
const savedRange = ref<string>("");

// Cash-debt detail dialog: one row at a time. The open flag is
// driven by the chip click; the session ref is captured at click
// time so the dialog renders the rows that exist on that date.
const cashDebtDialogOpen = ref(false);
const cashDebtDialogSession = ref<SimulatePayrollSessionDto | null>(null);
const openCashDebtDialog = (session: SimulatePayrollSessionDto): void => {
  cashDebtDialogSession.value = session;
  cashDebtDialogOpen.value = true;
};

// Per-column totals for the session table footer row. Computed
// client-side from the same session list the table renders so the
// numbers in the footer always agree with the per-row values
// above (defence in depth — the backend's rolled totals are shown
// in the SummaryBoxes just above the table).
interface SessionTotals {
  totalSales: number;
  commission: number;
  totalAttendance: number;
  mealAllowance: number;
  bonusTarget: number;
  totalSalary: number;
  cashDebt: number;
}
const sessionTotals = computed<SessionTotals>(() => {
  const t: SessionTotals = {
    totalSales: 0,
    commission: 0,
    totalAttendance: 0,
    mealAllowance: 0,
    bonusTarget: 0,
    totalSalary: 0,
    cashDebt: 0,
  };
  if (!simulation.value) return t;
  for (const s of simulation.value.sessions) {
    t.totalSales += s.totalSales;
    t.commission += s.commission;
    t.totalAttendance += s.attendance;
    t.mealAllowance += s.mealAllowance;
    t.bonusTarget += s.bonusTarget;
    t.totalSalary += s.totalSalary;
    t.cashDebt += cashDebtTotalFor(s);
  }
  return t;
});

// Sum the cash_debt rows attached to a session. Used by both the
// per-row chip and the rolling footer so the two numbers always
// agree. Defensive against the slice being null/undefined during
// a partial-update cycle.
const cashDebtTotalFor = (
  s: SimulatePayrollSessionDto | null | undefined,
): number => {
  if (!s?.cashDebts?.length) return 0;
  return s.cashDebts.reduce((acc, d) => acc + (d.amount ?? 0), 0);
};

const sessionColumns: QTableColumn<SimulatePayrollSessionDto>[] = [
  {
    name: "date",
    label: "Tanggal",
    field: "date",
    align: "left" as const,
    sortable: true,
  },
  {
    name: "status",
    label: "Status",
    field: "status",
    align: "left" as const,
    sortable: true,
  },
  {
    name: "totalSales",
    label: "Sales",
    field: "totalSales",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "mealAllowance",
    label: "Uang Makan",
    field: "mealAllowance",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "attendance",
    label: "Bonus Hadir",
    field: "attendance",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "commission",
    label: "Komisi",
    field: "commission",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "bonusTarget",
    label: "Bonus Target",
    field: "bonusTarget",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "totalSalary",
    label: "Total Gaji",
    field: "totalSalary",
    align: "right" as const,
    sortable: true,
  },
  {
    name: "cashDebts",
    label: "Cash Debt",
    field: "cashDebts",
    align: "right" as const,
    sortable: false,
  },
];

const runSimulate = async () => {
  if (!form.employee?.value) {
    $q.notify({ type: "negative", message: "Pilih karyawan terlebih dahulu" });
    return;
  }
  if (!form.startDate || !form.endDate) {
    $q.notify({
      type: "negative",
      message: "Tanggal mulai dan selesai wajib diisi",
    });
    return;
  }
  if (form.startDate > form.endDate) {
    $q.notify({
      type: "negative",
      message: "Tanggal mulai harus sebelum tanggal selesai",
    });
    return;
  }
  try {
    const result = await store.simulate({
      adminIdEmployee: form.employee.value,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    simulation.value = result;
    cashReceipt.value = 0;
    if (result.sessionCount === 0) {
      $q.notify({
        type: "warning",
        message: "Tidak ada sesi ditemukan di rentang tanggal tersebut",
      });
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal menjalankan simulasi";
    $q.notify({ type: "negative", message });
  }
};

const openSaveDialog = () => {
  cashReceipt.value = 0;
  saveDialogOpen.value = true;
};

// Build the per-session component breakdown from the simulation
// result. Each session contributes one row per non-zero component
// type so the saved payroll carries an audit trail back to the
// originating stock_session.
const buildComponents = (
  sim: SimulatePayrollResultDto,
): EmployeeSalaryComponentDto[] => {
  const out: EmployeeSalaryComponentDto[] = [];
  for (const s of sim.sessions) {
    if (s.commission > 0) {
      out.push({
        componentType: "COMMISSION",
        amount: s.commission,
        refId: s.sessionId,
        refTable: "stock_session",
        refSource: "SALES",
      });
    }
    if (s.mealAllowance > 0) {
      out.push({
        componentType: "MEAL_ALLOWANCE",
        amount: s.mealAllowance,
        refId: s.sessionId,
        refTable: "stock_session",
        refSource: "SALES",
      });
    }
    if (s.bonusTarget > 0) {
      out.push({
        componentType: "BONUS_TARGET",
        amount: s.bonusTarget,
        refId: s.sessionId,
        refTable: "stock_session",
        refSource: "SALES",
      });
    }
  }
  return out;
};

const confirmSave = async () => {
  if (!simulation.value || !form.employee?.value) return;
  try {
    const saved = await store.save({
      adminIdEmployee: form.employee.value,
      startDate: simulation.value.startDate,
      endDate: simulation.value.endDate,
      totalMealAllowance: simulation.value.totalMealAllowance,
      totalAttendanceAllowance: simulation.value.totalAttendanceAllowance,
      totalCommission: simulation.value.totalCommission,
      totalBonusTarget: simulation.value.totalBonusTarget,
      totalSalary: simulation.value.totalSalary,
      totalCashReceipt: cashReceipt.value ?? 0,
      components: buildComponents(simulation.value),
    });
    savedEmployeeLabel.value =
      `${form.employee.object?.firstName ?? ""} ${form.employee.object?.lastName ?? ""}`.trim() ||
      form.employee.label;
    savedRange.value = `${saved.startDate} → ${saved.endDate}`;
    saveDialogOpen.value = false;
    successDialogOpen.value = true;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal menyimpan payroll";
    $q.notify({ type: "negative", message });
  }
};

const onSuccessClose = () => {
  // Reset the simulation form so the operator can run a new run.
  simulation.value = null;
  cashReceipt.value = 0;
};
</script>
