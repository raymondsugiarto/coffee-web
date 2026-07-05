<template>
  <q-dialog v-model="confirm" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm"
          >Apakah yakin menghapus data {{ deleteItem }}?</span
        >
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Ya" color="primary" @click="handleClickDelete" />
        <q-btn label="Tidak" color="negative" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { api } from '@/boot/axios';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  deleteItem: {
    type: String,
    required: false,
  },
  successMessage: {
    type: String,
    required: false,
  },
  failedMessage: {
    type: String,
    required: false,
  },
  apiUrl: {
    type: String,
    required: true,
  },
});

const $q = useQuasar();
const confirm = ref(props.modelValue);
const { t } = useI18n();

const emit = defineEmits([
  'update:modelValue',
  'deleteSuccess',
  'deleteFailed',
]);

const handleClickDelete = () => {
  api
    .delete(props.apiUrl)
    .then(() => {
      $q.notify({
        color: 'positive',
        message: props.successMessage || '',
      });
      confirm.value = false;
      emit('update:modelValue', false);
      emit('deleteSuccess');
    })
    .catch((err) => {
      emit('deleteFailed', err);
      emit('update:modelValue', false);
      confirm.value = false;
      $q.notify({
        color: 'negative',
        message: t(err.message),
      });
    });
};

watch(
  () => props.modelValue,
  (value) => {
    confirm.value = value;
    emit('update:modelValue', value);
  }
);
</script>
