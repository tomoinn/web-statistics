<script setup>
import { onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { drawCircularPlot } from '../utils/circularPlot';

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  data: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['stats-change']);

const chartCanvas = shallowRef(null);
let mediaQuery = null;

function redraw() {
  if (!chartCanvas.value) {
    return;
  }
  const stats = drawCircularPlot(chartCanvas.value, props.config, props.data);
  emit('stats-change', stats);
}

function attachResolutionListener() {
  if (!window.devicePixelRatio || !window.matchMedia) {
    return;
  }

  if (mediaQuery) {
    mediaQuery.removeEventListener('change', onResolutionChanged);
  }
  mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
  mediaQuery.addEventListener('change', onResolutionChanged);
}

function onResolutionChanged() {
  attachResolutionListener();
  redraw();
}

watch(() => [props.config, props.data], redraw, { deep: true });

onMounted(() => {
  attachResolutionListener();
  redraw();
});

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', onResolutionChanged);
  }
});
</script>

<template>
  <canvas ref="chartCanvas" class="circular-plot"></canvas>
</template>
