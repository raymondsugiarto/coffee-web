<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" :to="{ name: 'dashboard' }" />
      <div class="text-h5 text-weight-bold q-ml-sm">Buka Sesi Pagi</div>
    </div>

    <MorningForm @saved="onSaved" />
  </q-page>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import MorningForm from "@/components/organization/stock-session/MorningForm.vue";

const $q = useQuasar();
const router = useRouter();

const onSaved = (id: string) => {
  $q.dialog({
    title: "Sesi berhasil dibuka",
    message: `Sesi ID: ${id}`,
    cancel: true,
    ok: {
      label: "Lanjut ke Penutupan",
      color: "green-8",
    },
  }).onOk(() => {
    router.push({ name: "stock-session-evening", query: { sessionId: id } });
  });
};
</script>
