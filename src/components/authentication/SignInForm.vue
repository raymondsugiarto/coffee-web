<template>
  <q-form @submit="handleSignIn">
    <q-input
      :label="t('username')"
      outlined
      dense
      v-model="username"
      lazy-rules
      :rules="[(val) => (val && val.length > 0) || t('required')]"
    >
    </q-input>

    <q-input
      :label="t('password')"
      outlined
      dense
      v-model="password"
      type="password"
      lazy-rules
      :rules="[(val) => (val && val.length > 0) || t('required')]"
    >
    </q-input>
    <q-banner v-if="error" class="text-white bg-red">{{
      t('usernamePasswordInvalid')
    }}</q-banner>
    <div class="q-mt-xl q-mb-md">
      <q-btn
        type="submit"
        color="accent"
        class="full-width"
        label="Masuk"
        no-caps
      />
    </div>
  </q-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authentication/auth-store';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/stores/app/app-store';

const { t } = useI18n();
const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(false);

const authStore = useAuthStore();
const appStore = useAppStore();

const handleSignIn = async () => {
  try {
    await authStore.signIn({
      username: username.value,
      password: password.value,
    });
    loading.value = false;
    void router.push(appStore.getHomePage());
  } catch {
    error.value = true;
    loading.value = false;
  }
};
</script>
