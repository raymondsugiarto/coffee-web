<template>
  <q-page :padding="$q.screen.gt.xs ? true : false">
    <div class="row items-center q-mb-md q-px-sm q-px-md-none">
      <q-btn
        flat
        round
        icon="arrow_back"
        :to="{ name: 'stock-session-list' }"
      />
      <div class="text-h6 text-h5-sm text-weight-bold q-ml-sm">
        {{ sessionId ? "Edit Sesi Pagi" : "Buka Sesi Pagi" }}
      </div>
    </div>
    <div class="q-px-sm q-px-md-none">
      <MorningForm
        ref="formRef"
        :session-id="sessionId"
        @saved="onSaved"
        @deleted="onDeleted"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import MorningForm from "@/components/organization/stock-session/MorningForm.vue";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const formRef = ref<InstanceType<typeof MorningForm> | null>(null);

// Edit-mode is driven by a `?sessionId=...` query param. The same
// page handles both the "open new" and "edit existing" flows so the
// user always lands on one route, regardless of which list button
// they tapped.
const sessionId = computed<string | null>(
  () => (route.query.sessionId as string | undefined) ?? null,
);

const onSaved = () => {
  const isEdit = !!sessionId.value;
  $q.dialog({
    title: isEdit ? "Sesi Berhasil Diperbarui" : "Sesi Berhasil Dibuka",
    message: isEdit
      ? "Perubahan sesi pagi telah tersimpan."
      : "Sesi pagi telah berhasil disimpan. Mau buka sesi lagi?",
    ok: {
      label: "Lihat Daftar Sesi",
      color: "primary",
      unelevated: true,
    },
    ...(isEdit
      ? {}
      : {
          cancel: {
            label: "Buka Sesi Baru",
            color: "grey-7",
            flat: true,
          },
        }),
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

const onDeleted = () => {
  void router.push({ name: "stock-session-list" });
};
</script>

<style scoped lang="scss">
@media (max-width: 599px) {
  .text-h5-sm {
    font-size: 1.1rem;
  }
}
</style>
