<template>
  <div class="q-pa-md">
    <div class="text-h6 text-center q-mb-lg">Registrasi</div>
    <SignUpForm @signup="handleSignUp" v-if="step == 1"></SignUpForm>
    <SignUpFormCompleted :form="form" v-else></SignUpFormCompleted>
  </div>
</template>

<script lang="ts" setup>
import SignUpForm from '@/components/authentication/company/SignUpForm.vue';
import SignUpFormCompleted from '@/components/authentication/company/SignUpFormCompleted.vue';
import { ref } from 'vue';

const step = ref(1);
const form = ref({
  picName: '',
  picEmail: '',
});

const handleSignUp = (data: { picName: string; picEmail: string }) => {
  step.value = 2;
  form.value = data;
};
</script>
