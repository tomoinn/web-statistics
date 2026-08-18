<script setup>
import {computed, reactive, shallowRef} from 'vue';
import CircularPlotCanvas from './CircularPlotCanvas.vue';
import {DEFAULT_CONFIG, normalizeConfig, parseDataInput} from '../utils/circularPlot';

const dataAsString = shallowRef('');
const plotConfig = reactive({...DEFAULT_CONFIG});
const plotStats = reactive({
  circularMean: null,
  vectorMagnitude: null,
  dataPointCount: 0
});

const numericKeys = [
  'lengthOfDay', 'binSize', 'canvasSize', 'mainAxisRadius', 'mainAxisWidth', 'axisTickWidth',
  'axisTickLength', 'binTickWidth', 'binTickSize', 'blobSize', 'meanBlobSize',
  'magnitudeBlobSize', 'magnitudeLineWidth', 'blobLineWidth', 'blobSep'
];

const colorKeys = ['mainAxisColour', 'axisTickColour', 'binTickColour', 'blobColour', 'modalBlobColour', 'meanBlobColour', 'magnitudeBlobColour'];

const plotData = computed(() => parseDataInput(dataAsString.value));
const safeConfig = computed(() => normalizeConfig(plotConfig));

const configJSON = computed({
  get() {
    return JSON.stringify({config: safeConfig.value, data: plotData.value});
  },
  set(value) {
    try {
      const parsed = JSON.parse(value);
      const incomingConfig = parsed.config || {};
      Object.keys(plotConfig).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(incomingConfig, key)) {
          plotConfig[key] = incomingConfig[key];
        }
      });
      dataAsString.value = Array.isArray(parsed.data) ? parsed.data.join(', ') : '';
    } catch {
      // ignore invalid JSON
    }
  }
});

function updateStats(stats) {
  plotStats.circularMean = stats.circularMean;
  plotStats.vectorMagnitude = stats.vectorMagnitude;
  plotStats.dataPointCount = stats.dataPointCount;
}
</script>

<template>
  <div class="circular-plot-page">
    <h2 class="text-h4 mb-2">Circular Plot</h2>
    <p class="mb-4">
      This page can be used to produce a circular plot with variable cycle length and binning.
    </p>
    <v-divider class="mb-6"/>

    <CircularPlotCanvas :config="safeConfig" :data="plotData" @stats-change="updateStats"/>

    <v-alert v-if="plotStats.dataPointCount > 0" class="stats-summary" type="info" variant="tonal">
      Circular mean is <strong>{{ plotStats.circularMean }}</strong>, vector magnitude is
      <strong>{{ plotStats.vectorMagnitude }}</strong>, there were
      <strong>{{ plotStats.dataPointCount }}</strong> data points.
    </v-alert>

    <v-divider class="my-6"/>
    <h3 class="text-h5 mb-2">Data</h3>
    <v-textarea
        v-model="dataAsString"
        rows="4"
        placeholder="Enter comma-separated integer/floating-point data"
        variant="outlined"
    />

    <v-divider class="my-6"/>
    <h3 class="text-h5 mb-4">Configuration</h3>
    <div class="config-grid mb-4">
      <v-text-field
          v-for="key in numericKeys"
          :key="key"
          v-model.number="plotConfig[key]"
          :label="key"
          type="number"
          variant="outlined"
          density="comfortable"
      />
    </div>

    <div class="config-grid">
      <v-text-field
          v-for="key in colorKeys"
          :key="key"
          v-model="plotConfig[key]"
          :label="key"
          type="color"
          variant="outlined"
          density="comfortable"
      />
    </div>

    <h3 class="text-h5 mb-2">Advanced</h3>
    <v-textarea v-model="configJSON" rows="6" variant="outlined"/>
  </div>
</template>

<style scoped>
.stats-summary {
  margin-top: 1rem;
}

.config-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
</style>
