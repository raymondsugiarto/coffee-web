<template>
  <q-layout view="lHh lpR lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Kontak360 </q-toolbar-title>

        <q-btn-dropdown flat label="Akun Saya" no-caps>
          <q-list>
            <q-item clickable v-ripple>
              <q-item-section @click="router.push('/change-password')"
                >Ganti Kata Sandi</q-item-section
              >
            </q-item>
            <q-item clickable v-ripple @click="handleLogout">
              <q-item-section>Keluar</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="230"
    >
      <div class="text-center q-mt-sm text-h5 va-font-semibold q-mb-md">
        <q-img src="~assets/logo.png" width="150px" />
      </div>
      <MainMenu></MainMenu>
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import MainMenu from '@/components/~global/MainMenu.vue';
import { useAuthStore } from '@/stores/authentication/auth-store';
import { useUserStore } from '@/stores/user/user-store';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const leftDrawerOpen = ref(false);
const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleLogout = async () => {
  await authStore.signOut();
};

onMounted(async () => {
  await userStore.loadMyProfile();
});
</script>
