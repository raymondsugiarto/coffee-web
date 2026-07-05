<template>
  <div>
    <q-input
      label="Nama PIC"
      outlined
      dense
      v-model="form.picName"
      lazy-rules
      :rules="[required]"
    >
      <template v-slot:prepend>
        <q-icon name="person" color="primary" />
      </template>
    </q-input>
    <q-input
      label="Email PIC"
      outlined
      dense
      v-model="form.picEmail"
      lazy-rules
      :rules="[(val) => (val && val.length > 0) || 'Field harus diisi']"
    >
      <template v-slot:prepend>
        <q-icon name="mail" color="primary" />
      </template>
    </q-input>
  </div>
</template>

<script lang="ts" setup>
import useValidation from '@/composables/validation';
import { ref } from 'vue';

interface Props {
  form: {
    picName: string;
    picEmail: string;
  };
}

const props = defineProps<Props>();
const { required } = useValidation();

const form = ref({
  picName: props.form.picName,
  picEmail: props.form.picEmail,
});
</script>
