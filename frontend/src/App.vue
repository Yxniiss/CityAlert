<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from '@/layout/appHeader.vue';
import AppFooter from '@/layout/appFooter.vue';
</script>

<template>
  <AppHeader />
  <main>
    <RouterView />
  </main>
  <AppFooter />
</template>

<style scoped>
main {
  min-height: calc(100vh - 68px);
}
</style>
