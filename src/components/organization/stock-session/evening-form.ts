// Composable that owns the close-session form state and helpers for the
// evening stock-session form. Splitting this out of `EveningForm.vue`
// keeps the view component lean and lets each sub-component (header,
// items table, payments, adjustments, summary) receive only the
// piece of state it needs.
//
// All child components consume this composable through a single
// `useEveningForm` call in the parent (`EveningForm.vue`) which then
// passes the relevant slices down as props. That keeps the data flow
// unidirectional and easy to audit.

import { computed, reactive, ref, watch, type Ref } from "vue";
import { useQuasar } from "quasar";
import { useStockSessionStore } from "@/stores/stock-session/stock-session-store";
import { formatCurrency } from "@/composables/format";
import type {
  CashAdjustmentInputDto,
  ItemDto,
  PaymentDetailInputDto,
  StockSessionDto,
  StockSessionItemDto,
  StockSessionItemInputDto,
} from "./types/stock-session";

// ===== Static option lists =====

export const PAYMENT_METHODS = [
  { value: "CASH", label: "CASH" },
  { value: "QRIS", label: "QRIS" },
  { value: "TRANSFER", label: "TRANSFER" },
  { value: "OTHER", label: "OTHER" },
] as const;

export const ADJUSTMENT_TYPES = [
  { value: "SHORTAGE", label: "SHORTAGE" },
  { value: "OVERAGE", label: "OVERAGE" },
] as const;

// ===== Row types exposed to sub-components =====

export interface ItemRow {
  itemId: string;
  item?: {
    name?: string;
    sku?: string;
    parentId?: string;
    parent?: { name?: string; id?: string } | undefined;
  };
  outQty: number;
  returnQty: number;
  /** Rolled-up total = cashSoldQty + cashlessSoldQty. */
  soldQty: number;
  cashSoldQty: number;
  cashlessSoldQty: number;
  sellingPriceSnapshot: number;
  subtotal: number;
}

export interface PaymentRow {
  paymentMethod: PaymentDetailInputDto["paymentMethod"];
  amount: number;
  notes?: string;
}

/**
 * A parent-aware inventory group. Built fresh whenever the form's
 * `items` change so every helper that needs to know "what rows share
 * this pool" can read it without recomputing.
 */
export interface ParentGroup {
  parentId: string;
  parentOutQty: number;
  memberIds: Set<string>;
}

// ===== Number coercion =====

/**
 * Coerces a backend-returned amount (`number | null | undefined | ""`)
 * to a safe finite `number`. q-input with v-model.number emits `""`
 * for empty inputs, which Go then refuses to unmarshal into float64.
 * Use this at any boundary between the API and the JSON body we send.
 */
export const numOrZero = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ===== Form state shape =====

export type EveningFormItem = StockSessionItemInputDto & {
  outQty: number;
  soldQty: number;
  subtotal: number;
  sellingPriceSnapshot: number;
};

export interface EveningFormState {
  items: EveningFormItem[];
  payments: PaymentDetailInputDto[];
  adjustments: CashAdjustmentInputDto[];
  notes: string;
}

export interface EveningTotals {
  totalSales: number;
  totalCash: number;
  totalQris: number;
  totalOther: number;
  totalPayment: number;
  difference: number;
}

/**
 * Bundles everything an evening sub-component might need. The parent
 * creates one of these once and passes the relevant slice (or the
 * whole thing) to each child via props.
 */
export interface EveningFormContext {
  /** Reactive form state (items / payments / adjustments / notes). */
  form: EveningFormState;
  /** True while auto-loading child variants after the session changes. */
  isLoadingChildren: Ref<boolean>;
  /** True while the close request is in flight. */
  submitting: Ref<boolean>;
  /** True when the bound session is closed. */
  isClosed: Ref<boolean>;

  // Totals & derived state
  totals: Ref<EveningTotals>;
  totalItems: Ref<number>;
  parentGroups: Ref<ParentGroup[]>;
  canClose: Ref<boolean>;
  differenceClass: Ref<string>;

  // Row helpers
  isParentRow: (row: EveningFormItem) => boolean;
  isChildRow: (row: EveningFormItem) => boolean;
  isParentReturnInvalid: (row: EveningFormItem) => boolean;
  isSoldInvalid: (row: EveningFormItem) => boolean;
  isReturnInvalid: (row: EveningFormItem) => boolean;
  poolRemainingForRow: (row: EveningFormItem) => number;
  outQtyForRow: (row: EveningFormItem) => number;
  remainingForRow: (g: ParentGroup, row: EveningFormItem) => number;
  groupOf: (row: EveningFormItem) => ParentGroup | undefined;
  parentNameFor: (row: EveningFormItem) => string | null;

  // Mutations
  onSoldSplitChanged: (row: EveningFormItem) => void;
  updateNotes: (value: string | number | null) => void;
  addPayment: () => void;
  removePayment: (idx: number) => void;
  addAdjustment: () => void;
  removeAdjustment: (idx: number) => void;

  // Lifecycle hooks invoked by the parent component
  onSessionChanged: (s: StockSessionDto | null) => Promise<void>;
  onFormMounted: () => Promise<void>;

  // Close action
  closeSession: (session: StockSessionDto) => Promise<StockSessionDto | null>;
}

/**
 * Build the full evening form context. Intended to be called exactly
 * once inside `<EveningForm>` (the parent component), which then
 * forwards the relevant pieces down to each sub-component.
 *
 * Pass the live `sessionRef` from the parent so the composable can
 * wire its watcher and close handler to the same reactive source the
 * template is bound to.
 */
export function useEveningForm(
  sessionRef: Ref<StockSessionDto | null>,
  emitClosed: (closed: StockSessionDto) => void,
): EveningFormContext {
  const $q = useQuasar();
  const store = useStockSessionStore();

  const submitting = ref(false);
  const isLoadingChildren = ref(false);

  const form = reactive<EveningFormState>({
    items: [],
    payments: [],
    adjustments: [],
    notes: "",
  });

  const isClosed = computed(() => sessionRef.value?.status === "CLOSED");

  // ===== Totals =====

  const totalItems = computed(() =>
    form.items.reduce((s, it) => s + (it.soldQty ?? 0), 0),
  );

  const totals = computed<EveningTotals>(() => {
    const totalSales = form.items.reduce((s, it) => s + (it.subtotal ?? 0), 0);
    let cash = 0,
      qris = 0,
      other = 0,
      totalPayment = 0;
    for (const p of form.payments) {
      totalPayment += Number(p.amount ?? 0);
      if (p.paymentMethod === "CASH") cash += Number(p.amount ?? 0);
      else if (p.paymentMethod === "QRIS") qris += Number(p.amount ?? 0);
      else if (p.paymentMethod === "TRANSFER" || p.paymentMethod === "OTHER") {
        other += Number(p.amount ?? 0);
      }
    }
    return {
      totalSales,
      totalCash: cash,
      totalQris: qris,
      totalOther: other,
      totalPayment,
      difference: totalPayment - totalSales,
    };
  });

  const differenceClass = computed(() =>
    Math.abs(totals.value.difference) < 0.01
      ? "text-grey-7"
      : totals.value.difference < 0
        ? "text-red-9"
        : "text-green-9",
  );

  // ===== Parent-aware validation =====

  const parentGroups = computed<ParentGroup[]>(() => {
    const groups = new Map<string, ParentGroup>();
    const parentOutFor = (id: string): number => {
      const pr = form.items.find((r) => (r.item?.id ?? r.itemId) === id);
      return pr?.outQty ?? 0;
    };
    for (const it of form.items) {
      const ownId = it.item?.id ?? it.itemId;
      const parentId = it.item?.parent?.id || it.item?.parentId || "";
      if (!parentId || parentId === ownId) continue;
      let g = groups.get(parentId);
      if (!g) {
        g = {
          parentId,
          parentOutQty: parentOutFor(parentId),
          memberIds: new Set<string>(),
        };
        groups.set(parentId, g);
      }
      g.memberIds.add(it.itemId);
      g.parentOutQty = parentOutFor(parentId);
    }
    return Array.from(groups.values());
  });

  const groupOf = (row: EveningFormItem): ParentGroup | undefined => {
    const ownId = row.itemId;
    const parentId = row.item?.parent?.id || row.item?.parentId || "";
    if (parentId && parentId !== ownId) {
      return parentGroups.value.find((g) => g.parentId === parentId);
    }
    // Bare rows whose parent *is in the session* belong to the parent's group too.
    const ownIdAsParent = row.item?.id ?? row.itemId;
    return parentGroups.value.find((g) => g.parentId === ownIdAsParent);
  };

  /** Group-level invalid: parent.return + Σ group rows' soldQty > parent.outQty. */
  const parentGroupOverflowFor = (g: ParentGroup): boolean => {
    const parentRow = form.items.find(
      (r) => (r.item?.id ?? r.itemId) === g.parentId,
    );
    if (!parentRow) return true;
    const parentReturn = Math.max(0, Number(parentRow.returnQty) || 0);
    const totalSold = form.items.reduce((sum, it) => {
      const isMember =
        g.memberIds.has(it.itemId) || (it.item?.id ?? it.itemId) === g.parentId;
      return isMember ? sum + Math.max(0, Number(it.soldQty) || 0) : sum;
    }, 0);
    return parentReturn + totalSold > g.parentOutQty;
  };

  const canClose = computed(
    () =>
      !isClosed.value &&
      form.items.length > 0 &&
      form.items.every((it) => !isReturnInvalid(it) && !isSoldInvalid(it)) &&
      parentGroups.value.every((g) => !parentGroupOverflowFor(g)) &&
      form.payments.length > 0 &&
      form.payments.every(
        (p) =>
          Number.isFinite(p.amount) &&
          p.amount >= 0 &&
          (p.paymentMethod === "CASH" ||
            p.paymentMethod === "QRIS" ||
            p.paymentMethod === "TRANSFER" ||
            p.paymentMethod === "OTHER"),
      ),
  );

  // ===== Row helpers =====

  const isParentRow = (row: EveningFormItem): boolean => {
    const ownId = row.item?.id ?? row.itemId;
    const parentId = row.item?.parent?.id || row.item?.parentId || "";
    return !parentId || parentId === ownId;
  };

  const isChildRow = (row: EveningFormItem): boolean => {
    const ownId = row.item?.id ?? row.itemId;
    const parentId = row.item?.parent?.id || row.item?.parentId || "";
    return !!parentId && parentId !== ownId;
  };

  const isParentReturnInvalid = (row: EveningFormItem): boolean => {
    const v = Number(row.returnQty);
    if (Number.isNaN(v) || v < 0 || !Number.isInteger(v)) return true;
    return v > (row.outQty ?? 0);
  };

  const isSoldInvalid = (row: EveningFormItem): boolean => {
    const v = Number(row.soldQty);
    if (Number.isNaN(v) || v < 0 || !Number.isInteger(v)) return true;
    const g = groupOf(row);
    if (!g) return false;
    const remaining = remainingForRow(g, row);
    return v > remaining;
  };

  /** Per-row returnQty validity check (only ever called for parent rows). */
  const isReturnInvalid = (row: EveningFormItem): boolean => {
    const v = Number(row.returnQty);
    if (Number.isNaN(v) || v < 0 || !Number.isInteger(v)) return true;
    return v > Math.max(0, row.outQty ?? 0);
  };

  /** Remaining pool units that `row` is allowed to claim as terjual. */
  const remainingForRow = (g: ParentGroup, row: EveningFormItem): number => {
    const parentRow = form.items.find(
      (r) => (r.item?.id ?? r.itemId) === g.parentId,
    );
    if (!parentRow) return 0;
    const parentReturn = Math.max(0, Number(parentRow.returnQty) || 0);
    const othersSold = form.items.reduce((sum, it) => {
      if (it.itemId === row.itemId) return sum;
      const isMember =
        g.memberIds.has(it.itemId) || (it.item?.id ?? it.itemId) === g.parentId;
      return isMember ? sum + Math.max(0, Number(it.soldQty) || 0) : sum;
    }, 0);
    return Math.max(0, g.parentOutQty - parentReturn - othersSold);
  };

  /** Effective outQty of a row used by the inline invalid hint (over- the-pool). */
  const outQtyForRow = (row: EveningFormItem): number =>
    Math.max(0, Number(row.outQty) || 0);

  /**
   * Remaining pool capacity surfaced on the parent row (and on orphan
   * / single-item rows that have no group). See full doc on the
   * original implementation; child rows render "—" because every
   * row in a group would show the same number.
   */
  const poolRemainingForRow = (row: EveningFormItem): number => {
    const g = groupOf(row);
    if (!g) {
      const out = Math.max(0, Number(row.outQty) || 0);
      const ret = Math.max(0, Number(row.returnQty) || 0);
      const sold = Math.max(0, Number(row.soldQty) || 0);
      return out - ret - sold;
    }
    const parentRow = form.items.find(
      (r) => (r.item?.id ?? r.itemId) === g.parentId,
    );
    if (!parentRow) return 0;
    const parentReturn = Math.max(0, Number(parentRow.returnQty) || 0);
    const totalSold = form.items.reduce((sum, it) => {
      const isMember =
        g.memberIds.has(it.itemId) || (it.item?.id ?? it.itemId) === g.parentId;
      return isMember ? sum + Math.max(0, Number(it.soldQty) || 0) : sum;
    }, 0);
    return g.parentOutQty - parentReturn - totalSold;
  };

  /**
   * Resolve a child row's parent product name. Tries in order:
   *   1. nested `item.parent.name` from the backend
   *   2. parent row already loaded in this session's form
   *   3. cached catalog (`store.items`)
   *   4. raw `parentId` UUID as a last-resort fallback
   * Returns `null` when the row has no parent at all.
   */
  const parentNameFor = (row: EveningFormItem): string | null => {
    const parentId = row.item?.parent?.id || row.item?.parentId || "";
    if (!parentId) return null;

    const nested = row.item?.parent?.name;
    if (nested) return nested;

    const inForm = form.items.find(
      (r) => (r.item?.id ?? r.itemId) === parentId,
    );
    if (inForm?.item?.name) return inForm.item.name;

    const cached = store.items.find((p) => p.id === parentId);
    if (cached?.name) return cached.name;

    return parentId;
  };

  // ===== Mutations =====

  /**
   * Recompute the rolled `soldQty` (cash + cashless) and `subtotal`
   * for a row whose split inputs just changed.
   */
  const onSoldSplitChanged = (row: EveningFormItem): void => {
    const cash = Math.max(0, Number(row.cashSoldQty) || 0);
    const cashless = Math.max(0, Number(row.cashlessSoldQty) || 0);
    row.cashSoldQty = cash;
    row.cashlessSoldQty = cashless;
    row.soldQty = cash + cashless;
    row.subtotal = row.soldQty * (Number(row.sellingPriceSnapshot) || 0);
  };

  const updateNotes = (value: string | number | null): void => {
    form.notes = value === null || value === undefined ? "" : String(value);
  };

  const addPayment = (): void => {
    form.payments.push({ paymentMethod: "CASH", amount: 0 });
  };

  const removePayment = (idx: number): void => {
    form.payments.splice(idx, 1);
  };

  const addAdjustment = (): void => {
    form.adjustments.push({ type: "SHORTAGE", amount: 0 });
  };

  const removeAdjustment = (idx: number): void => {
    form.adjustments.splice(idx, 1);
  };

  // ===== Lifecycle hooks =====

  /**
   * Fetch child variants for each opened item and interleave them
   * directly under their parent in `form.items`. Idempotent — re-
   * running on the same session is a no-op.
   */
  async function loadChildrenForCurrentItems(): Promise<void> {
    const parentIds = form.items
      .map((it) => it.item?.id ?? it.itemId)
      .filter((id): id is string => !!id);
    if (parentIds.length === 0) return;

    isLoadingChildren.value = true;
    try {
      const children = await store.fetchItemChildren(
        sessionRef.value?.employeeId,
        parentIds,
      );
      if (!children || children.length === 0) return;

      const existingIds = new Set(form.items.map((it) => it.itemId));
      const byParent = new Map<string, ItemDto[]>();
      const orphans: ItemDto[] = [];
      for (const c of children) {
        if (existingIds.has(c.id)) continue;
        if (c.parentId && byParent.has(c.parentId)) {
          byParent.get(c.parentId)?.push(c);
        } else if (c.parentId) {
          byParent.set(c.parentId, [c]);
        } else {
          orphans.push(c);
        }
      }

      // Sort children within each parent group by name so the table
      // stays visually ordered.
      for (const list of byParent.values()) {
        list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
      }

      // Walk bottom-up so the splice indices we capture remain
      // valid as we insert children beneath their parents.
      for (let i = form.items.length - 1; i >= 0; i--) {
        const parent = form.items[i];
        if (!parent) continue;
        const pid = parent.item?.id ?? parent.itemId;
        const kids = byParent.get(pid);
        if (!kids || kids.length === 0) continue;
        const toInsert = kids.map((c) => ({
          itemId: c.id,
          item: c,
          outQty: 0,
          returnQty: 0,
          sellingPriceSnapshot: c.sellingPrice,
          cashSoldQty: 0,
          cashlessSoldQty: 0,
          soldQty: 0,
          subtotal: 0,
        }));
        form.items.splice(i + 1, 0, ...toInsert);
      }

      // Anything that arrived without a recognizable parentId falls
      // through to the bottom of the table — better than dropping.
      if (orphans.length > 0) {
        for (const c of orphans) {
          form.items.push({
            itemId: c.id,
            item: c,
            outQty: 0,
            returnQty: 0,
            sellingPriceSnapshot: c.sellingPrice,
            cashSoldQty: 0,
            cashlessSoldQty: 0,
            soldQty: 0,
            subtotal: 0,
          });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      $q.notify({
        type: "warning",
        message: "Gagal memuat varian produk.",
        caption: message,
      });
    } finally {
      isLoadingChildren.value = false;
    }
  }

  const onSessionChanged = async (s: StockSessionDto | null): Promise<void> => {
    if (!s) return;
    form.items = (s.items ?? []).map((it: StockSessionItemDto) => {
      // Historical rows persisted before the migration only have
      // soldQty; assign it all to cash so the rolled subtotal stays
      // correct when re-edited.
      const cashSplit = numOrZero(it.cashSoldQty);
      const cashlessSplit = numOrZero(it.cashlessSoldQty);
      const rolledSold = numOrZero(it.soldQty);
      const splitSum = cashSplit + cashlessSplit;
      const cash = splitSum > 0 ? cashSplit : rolledSold;
      const cashless = splitSum > 0 ? cashlessSplit : 0;
      return {
        itemId: it.itemId,
        item: it.item,
        outQty: numOrZero(it.outQty),
        returnQty: numOrZero(it.returnQty),
        sellingPriceSnapshot: it.sellingPriceSnapshot,
        cashSoldQty: cash,
        cashlessSoldQty: cashless,
        soldQty: cash + cashless,
        subtotal: it.subtotal,
      };
    });
    form.payments = (s.payments ?? []).map((p) => ({
      paymentMethod: p.paymentMethod,
      amount: numOrZero(p.amount),
      referenceNumber: p.referenceNumber,
      notes: p.notes,
    }));
    form.adjustments = (s.adjustments ?? []).map((a) => ({
      type: a.type,
      amount: numOrZero(a.amount),
      reason: a.reason,
    }));
    form.notes = s.notes ?? "";

    // Auto-expand variants.
    await loadChildrenForCurrentItems();
  };

  const onFormMounted = async (): Promise<void> => {
    // Backup path: if the watcher fired before props.session had
    // items, call again now that the component is fully mounted.
    if (
      sessionRef.value?.items?.length &&
      form.items.length === sessionRef.value.items.length
    ) {
      await loadChildrenForCurrentItems();
    }

    // Pre-warm the catalog cache so parent-name lookups don't fall
    // back to raw UUIDs on the first render.
    try {
      await store.fetchItems();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.debug("catalog warm-up failed (non-fatal):", message);
    }
  };

  // ===== Close action =====

  const closeSession = async (
    session: StockSessionDto,
  ): Promise<StockSessionDto | null> => {
    if (!session || isClosed.value) return null;
    submitting.value = true;
    try {
      await store.closeSession(session.id, {
        items: form.items.map((it) => {
          const isParent = isParentRow(it);
          const cash = Math.max(0, numOrZero(it.cashSoldQty));
          const cashless = Math.max(0, numOrZero(it.cashlessSoldQty));
          return {
            itemId: it.itemId,
            cashSoldQty: cash,
            cashlessSoldQty: cashless,
            returnQty: isParent ? numOrZero(it.returnQty) : 0,
          };
        }),
        payments: form.payments.map((p) => ({
          paymentMethod: p.paymentMethod,
          amount: numOrZero(p.amount),
          referenceNumber: p.referenceNumber,
          notes: p.notes,
        })),
        adjustments: form.adjustments.map((a) => ({
          type: a.type,
          amount: numOrZero(a.amount),
          reason: a.reason,
        })),
        notes: form.notes,
      });
      const closed = store.currentSession ?? session;
      emitClosed(closed);
      return closed;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      $q.notify({
        type: "negative",
        message: "Gagal menutup sesi.",
        caption: message,
      });
      return null;
    } finally {
      submitting.value = false;
    }
  };

  // Keep the watcher inside the composable so the form refills
  // whenever the bound session changes.
  watch(
    sessionRef,
    (s) => {
      void onSessionChanged(s);
    },
    { immediate: true, deep: true },
  );

  return {
    form,
    isLoadingChildren,
    submitting,
    isClosed,
    totals,
    totalItems,
    parentGroups,
    canClose,
    differenceClass,
    isParentRow,
    isChildRow,
    isParentReturnInvalid,
    isSoldInvalid,
    isReturnInvalid,
    poolRemainingForRow,
    outQtyForRow,
    updateNotes,
    remainingForRow,
    groupOf,
    parentNameFor,
    onSoldSplitChanged,
    addPayment,
    removePayment,
    addAdjustment,
    removeAdjustment,
    onSessionChanged,
    onFormMounted,
    closeSession,
  };
}

// ===== Pure helpers re-exported for sub-components =====

export const formatTime = (iso?: string): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", { hour12: false });
};

export { formatCurrency };
