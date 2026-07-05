<template>
  <div>
    <q-btn
      v-if="targetEdit"
      flat
      dense
      round
      size="sm"
      icon="edit"
      aria-label="Edit"
      color="warning"
      :to="targetEdit"
    />
    <q-btn
      v-if="deletedButton"
      flat
      dense
      round
      size="sm"
      icon="delete"
      aria-label="Delete"
      color="negative"
      @click="onDeleted"
      class="q-mr-sm"
    />
    <q-icon
      name="visibility"
      class="cursor-pointer"
      size="xs"
      color="info"
      @click="router.push(targetView ?? '')"
    ></q-icon>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  props: {
    type: Object,
    required: true,
  },
  targetEdit: {
    type: [String, Object],
    required: false,
  },
  targetView: {
    type: [String, Object],
    required: false,
  },
  deletedButton: {
    type: Boolean,
    default: true,
  },
});

const router = useRouter();
const emit = defineEmits(['delete']);

const onDeleted = () => {
  emit('delete', props);
};
</script>
