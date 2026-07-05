<template>
  <div class="q-mb-xl">
    <q-input
      :label="t('picName')"
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
      :label="t('picEmail')"
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
  <q-btn
    class="full-width"
    color="primary"
    label="Daftar"
    no-caps
    @click="handleSignUp"
  />
  <div class="row justify-between q-mt-md">
    <router-link to="/sign-in" class="text-primary"
      >Kembali Halaman Utama</router-link
    >
    <router-link to="/sign-in" class="text-primary">Masuk Sekarang</router-link>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
// import { useRouter } from 'vue-router';
// import { useAuthStore } from '@/stores/authentication/auth-store';
import useValidation from '@/composables/validation';
import { useI18n } from 'vue-i18n';

const form = ref({
  picName: '',
  picEmail: '',
});
// const loading = ref(false);
// const error = ref(false);

const { t } = useI18n();
const { required } = useValidation();
// const { signUp } = useAuthStore();
const emit = defineEmits(['signup']);

const handleSignUp = () => {
  emit('signup', form.value);
  // await signUp(form.value)
  //   .then(() => {
  //     loading.value = false;
  //     router.push('/');
  //   })
  //   .catch(() => {
  //     error.value = true;
  //     loading.value = false;
  //   });
};
</script>
