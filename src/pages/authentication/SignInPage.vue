<template>
  <div class="text-center q-mt-xl q-pt-xl q-px-xl">
    <!-- <q-img src="~assets/logo.png" width="300px" class="q-mb-md"></q-img> -->
    <div class="text-h4 text-bold text-left">Hello Again</div>
    <div class="text-h5 q-mb-md text-left">Welcome</div>
    <div class="q-py-md">
      <SignInForm></SignInForm>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SignInForm from '@/components/authentication/SignInForm.vue';
</script>
