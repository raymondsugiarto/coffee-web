<template>
  <q-page :padding="$q.screen.gt.xs ? true : false">
    <div class="row items-center q-mb-md q-px-sm q-px-md-none">
      <q-btn flat round icon="arrow_back" :to="{ name: 'dashboard' }" />
      <div class="text-h6 text-h5-sm text-weight-bold q-ml-sm">
        Buka Sesi Pagi
      </div>
    </div>
    <div class="q-px-sm q-px-md-none">
      <MorningForm ref="formRef" @saved="onSaved" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import MorningForm from "@/components/organization/stock-session/MorningForm.vue";

const $q = useQuasar();
const router = useRouter();
const formRef = ref<InstanceType<typeof MorningForm> | null>(null);

const onSaved = () => {
  $q.dialog({
    title: "Sesi Berhasil Dibuka",
    message: "Sesi pagi telah berhasil disimpan. Mau buka sesi lagi?",
    ok: {
      label: "Lihat Daftar Sesi",
      color: "primary",
      unelevated: true,
    },
    cancel: {
      label: "Buka Sesi Baru",
      color: "grey-7",
      flat: true,
    },
    persistent: true,
  })
    .onOk(() => {
      // "Lihat Daftar Sesi" — go to the list page.
      void router.push({ name: "stock-session-list" });
    })
    .onCancel(() => {
      // "Buka Sesi Baru" — reset the form so the admin can start a
      // fresh session for the next driver without leaving the page.
      formRef.value?.reset();
    });
};
</script>

<style scoped lang="scss">
@media (max-width: 599px) {
  .text-h5-sm {
    font-size: 1.1rem;
  }
}
</style>
