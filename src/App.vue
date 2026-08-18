<script setup>
import {computed, defineAsyncComponent, onMounted, onUnmounted, shallowRef} from 'vue';
import NavBar from './components/NavBar.vue';

const HomePage = defineAsyncComponent(() => import('./components/HomePage.vue'));
const CircularPlotPage = defineAsyncComponent(() => import('./components/CircularPlotPage.vue'));

const currentHash = shallowRef(window.location.hash || '#');

const page = computed(() => {
  if (currentHash.value === '#about') {
    return 'about';
  }
  if (currentHash.value === '#circular-plot') {
    return 'circular-plot';
  }
  return 'home';
});

const currentPageComponent = computed(() => page.value === 'home' ? HomePage : CircularPlotPage);

function onHashChanged() {
  currentHash.value = window.location.hash || '#';
}

onMounted(() => {
  window.addEventListener('hashchange', onHashChanged);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', onHashChanged);
});
</script>

<template>
  <v-app>
    <NavBar :page="page"/>
    <v-main id="page">
      <v-container class="">
        <component :is="currentPageComponent"/>
      </v-container>
    </v-main>
  </v-app>
</template>
