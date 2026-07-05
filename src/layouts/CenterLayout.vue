<template>
  <q-layout view="lHh lpr lff" class="bg-grey-2">
    <q-page-container>
      <q-page class="fullscreen row">
        <div class="col-8 mobile-hide desktop-only">
          <q-img src="~assets/left-panel.png" />
        </div>
        <div class="col-12 col-md-4">
          <div class="q-px-xl">
            <router-view />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup></script>
