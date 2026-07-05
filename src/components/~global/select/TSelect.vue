<template>
  <q-select
    ref="select"
    :readonly="readonly"
    :disable="disable"
    v-model="model"
    :options="options"
    :loading="loading"
    @filter="handleFilter"
    @update:model-value="handleSelected"
    @virtual-scroll="onScroll"
    outlined
    dense
    use-input
    :multiple="multiple"
    clearable
    :lazy-rules="lazyRules"
    :rules="rules"
  >
    <template #before-options v-if="$slots['before-options']">
      <slot name="before-options" />
    </template>

    <template #hint v-if="$slots['hint']">
      <slot name="hint" />
    </template>

    <template v-if="$slots['option']" v-slot:option="scope">
      <slot name="option" v-bind="scope" />
    </template>

    <template #no-option>
      <q-item v-if="$slots['no-ptions']">
        <q-item-section class="text-grey"> No results </q-item-section>
      </q-item>
      <slot name="no-option" v-else />
    </template>
    <template v-slot:selected-item="scope" v-if="multiple">
      <q-chip
        removable
        @remove="scope.removeAtIndex(scope.index)"
        :tabindex="scope.tabindex"
        color="secondary"
        text-color="white"
      >
        {{ scope.opt.label }}</q-chip
      >
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type {
  QSelectScrollOption,
  QSelectValue,
  TSelectProps,
} from '@/types/components/tselect';
import { useSelect } from '@/composables/tselect';
import type { QSelect } from 'quasar';

defineOptions({
  name: 'TSelect',
});

const props = withDefaults(defineProps<TSelectProps>(), {
  multiple: false,
  lazyRules: false,
  optionValue: 'id',
  optionLabel: 'name',
  rules: () => [],
  readonly: false,
  disable: false,
});

const select = ref<QSelect | null>(null);
const model = ref();
const { onSelectScroll, onFilterFn, resetOptions, loading, options } =
  useSelect(props.api);
const emit = defineEmits(['update:modelValue']);

const urlParams = computed(() => {
  resetOptions();
  return props.urlParams;
});

const endpoint = computed(() => {
  resetOptions();
  return props.endpoint;
});

const scrollOption = computed<QSelectScrollOption>({
  get: (): QSelectScrollOption => {
    return {
      endpoint: endpoint.value,
      params: urlParams.value,
      mapper: (item: unknown) => {
        if (props.mapper) {
          return props.mapper(item as Record<string, unknown>);
        }

        const record = item as Record<string, unknown>;
        return {
          value: String(record[props.optionValue]),
          label: String(record[props.optionLabel]),
          object: record,
        };
      },
    };
  },
  set: (val: QSelectScrollOption) => {
    return val;
  },
});

const hasError = computed(() => {
  return select.value?.hasError;
});

const validate = () => {
  return select.value?.validate();
};

const onScroll = ({ index, to }: { index: number; to: number }) => {
  void onSelectScroll({ index, to }, scrollOption.value);
};

const handleFilter = (
  val: string,
  doneFn: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
  abortFn: () => void
) => {
  onFilterFn({ val, doneFn, abortFn }, scrollOption.value);
};

const handleSelected = (value: QSelectValue) => {
  emit('update:modelValue', value);
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      resetOptions();
    }
    model.value = newValue;
  }
);

onMounted(() => {
  if (props.modelValue) {
    options.value.push(props.modelValue);
    model.value = props.modelValue;
  }
});

defineExpose({
  hasError,
  validate,
  select,
});
</script>
