import type { QSelect, QSelectSlots, ValidationRule } from "quasar";
import type { AxiosInstance } from "axios";

export interface QSelectValue<T = unknown> {
  value: string;
  label: string;
  object?: T;
}
export interface QSelectScrollOption<T = unknown> {
  endpoint: string;
  mapper: (item: T) => QSelectValue<T>;
  params?: URLSearchParams | undefined;
}

export interface filterFnArgs {
  val: string;
  doneFn: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void;
  abortFn: () => void;
}

export interface TSelectProps {
  api: AxiosInstance;
  modelValue: QSelectValue<unknown> | undefined;
  endpoint: string;
  multiple?: boolean;
  optionValue?: string;
  optionLabel?: string;
  lazyRules?: boolean;
  rules?: ValidationRule[];
  urlParams?: URLSearchParams | undefined;
  readonly?: boolean;
  disable?: boolean;
  mapper?: (args: unknown) => QSelectValue;
}

export type TSelectSlots = QSelectSlots;
