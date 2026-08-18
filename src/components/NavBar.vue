<script setup>
defineProps({
  page: {
    type: String,
    required: true
  }
});
</script>

<template>
  <v-app-bar color="primary" density="comfortable" flat>
    <v-app-bar-title>webStats</v-app-bar-title>
    <v-btn :variant="page === 'home' ? 'tonal' : 'text'" href="#">Home</v-btn>
    <v-btn :variant="page === 'circular-plot' ? 'tonal' : 'text'" href="#circular-plot">Circular Plot</v-btn>
  </v-app-bar>
</template>
