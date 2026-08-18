<script setup>
import { computed, reactive, shallowRef } from 'vue';
import CircularPlotCanvas from './CircularPlotCanvas.vue';
import { DEFAULT_CONFIG, normalizeConfig, parseDataInput } from '../utils/circularPlot';

const dataAsString = shallowRef('');
const plotConfig = reactive({ ...DEFAULT_CONFIG });
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
    return JSON.stringify({ config: safeConfig.value, data: plotData.value });
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
  <div>
    <h2>Circular Plot</h2>
    <p>
      This page can be used to produce a circular plot with variable cycle length and binning.
    </p>
    <hr>

    <CircularPlotCanvas :config="safeConfig" :data="plotData" @stats-change="updateStats" />

    <div v-if="plotStats.dataPointCount > 0" class="stats-summary">
      Circular mean is <strong>{{ plotStats.circularMean }}</strong>, vector magnitude is
      <strong>{{ plotStats.vectorMagnitude }}</strong>, there were
      <strong>{{ plotStats.dataPointCount }}</strong> data points.
    </div>

    <hr>
    <h2>Data</h2>
    <textarea
      v-model="dataAsString"
      rows="4"
      cols="80"
      class="form-control"
      placeholder="Enter comma-separated integer/floating-point data"
    ></textarea>

    <hr>
    <h2>Configuration</h2>
    <form class="form-horizontal">
      <div v-for="key in numericKeys" :key="key" class="form-group">
        <label class="control-label col-xs-4">{{ key }}</label>
        <div class="col-xs-8">
          <input v-model="plotConfig[key]" type="number" class="form-control">
        </div>
      </div>
      <div v-for="key in colorKeys" :key="key" class="form-group">
        <label class="control-label col-xs-4">{{ key }}</label>
        <div class="col-xs-8">
          <input v-model="plotConfig[key]" type="color" class="form-control">
        </div>
      </div>
    </form>

    <h2>Advanced</h2>
    <textarea v-model="configJSON" rows="6" cols="120" class="form-control"></textarea>
  </div>
</template>

<style scoped>
.stats-summary {
  margin-top: 1rem;
}
</style>
