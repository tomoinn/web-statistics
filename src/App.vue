<script setup>
import {computed, onMounted, onUnmounted, shallowRef} from 'vue';
import NavBar from './components/NavBar.vue';
import HomePage from './components/HomePage.vue';
import AboutPage from './components/AboutPage.vue';
import CircularPlotPage from './components/CircularPlotPage.vue';

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
      <v-container class="py-6">
        <HomePage v-if="page === 'home'"/>
        <AboutPage v-else-if="page === 'about'"/>
        <CircularPlotPage v-else/>
      </v-container>
    </v-main>
  </v-app>
</template>
