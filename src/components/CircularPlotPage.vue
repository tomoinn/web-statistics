<script setup>
import {computed, reactive, shallowRef} from 'vue';
import CircularPlotCanvas from './CircularPlotCanvas.vue';
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  parseCircularPlotState,
  parseDataInput,
  serializeCircularPlotState
} from '../utils/circularPlot';

const dataAsString = shallowRef('');
const isDraggingStateFile = shallowRef(false);
const dragEventDepth = shallowRef(0);
const importError = shallowRef('');
const exportError = shallowRef('');
const fileInput = shallowRef(null);
const plotContainer = shallowRef(null);
const pngExportSizes = [500, 1000, 2000];
const plotConfig = reactive({...DEFAULT_CONFIG});
const plotStats = reactive({
  circularMean: null,
  vectorMagnitude: null,
  dataPointCount: 0
});

const dataKeys = {
  lengthOfDay: 'Length of day (hours)',
  binSize: 'Bin size (hours)'
};

const numericKeys = {
  mainAxisWidth: '',
  axisTickWidth: '',
  axisTickLength: '',
  binTickWidth: '',
  binTickSize: '',
  blobSize: '',
  meanBlobSize: '',
  magnitudeBlobSize: '',
  magnitudeLineWidth: '',
  blobLineWidth: '',
  blobSep: ''
};

const colorKeys = {
  mainAxisColour: '',
  axisTickColour: '',
  binTickColour: '',
  blobColour: '',
  modalBlobColour: '',
  meanBlobColour: '',
  magnitudeBlobColour: ''
};

const booleanKeys = {
  showHourNumbers: 'Show hour labels'
};

const plotData = computed(() => parseDataInput(dataAsString.value));
const safeConfig = computed(() => normalizeConfig(plotConfig));

const configModel = computed({
  get() {
    return safeConfig.value;
  },
  set(value) {
    const incomingConfig = normalizeConfig(value || {});
    Object.keys(plotConfig).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(incomingConfig, key)) {
        plotConfig[key] = incomingConfig[key];
      }
    });
  }
});

const dataModel = computed({
  get() {
    return plotData.value;
  },
  set(value) {
    dataAsString.value = Array.isArray(value) ? value.join(', ') : '';
  }
});

const configJSON = computed({
  get() {
    return serializeCircularPlotState(safeConfig.value, plotData.value);
  },
  set(value) {
    try {
      applyImportedState(parseCircularPlotState(value));
      importError.value = '';
    } catch {
      importError.value = 'Could not parse state JSON';
    }
  }
});

function updateStats(stats) {
  plotStats.circularMean = stats.circularMean;
  plotStats.vectorMagnitude = stats.vectorMagnitude;
  plotStats.dataPointCount = stats.dataPointCount;
}

function applyImportedState(state) {
  configModel.value = state.config;
  dataModel.value = state.data;
}

function exportStateToFile() {
  const content = serializeCircularPlotState(safeConfig.value, plotData.value);
  const blob = new Blob([content], {type: 'application/json'});
  downloadBlob(blob, 'circular-plot-state.json');
}

function downloadBlob(blob, filename) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = downloadUrl;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(downloadUrl);
}

function getPlotSvgContent() {
  const plotSvg = plotContainer.value?.querySelector('svg.circular-plot');
  if (!plotSvg) {
    throw new Error('Plot SVG is not available');
  }

  const svgNode = plotSvg.cloneNode(true);
  svgNode.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgNode.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  return new XMLSerializer().serializeToString(svgNode);
}

function exportPlotAsSvg() {
  try {
    const svgContent = getPlotSvgContent();
    const svgBlob = new Blob([svgContent], {type: 'image/svg+xml;charset=utf-8'});
    downloadBlob(svgBlob, 'circular-plot.svg');
    exportError.value = '';
  } catch {
    exportError.value = 'Could not export the plot as SVG';
  }
}

async function exportPlotAsPng(canvasSize = 1000) {
  let svgUrl = '';

  try {
    const targetCanvasSize = pngExportSizes.includes(canvasSize) ? canvasSize : 1000;
    const svgContent = getPlotSvgContent();
    const svgBlob = new Blob([svgContent], {type: 'image/svg+xml;charset=utf-8'});
    svgUrl = URL.createObjectURL(svgBlob);

    const image = await new Promise((resolve, reject) => {
      const imageElement = new Image();
      imageElement.onload = () => resolve(imageElement);
      imageElement.onerror = () => reject(new Error('Could not render SVG'));
      imageElement.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = targetCanvasSize;
    canvas.height = targetCanvasSize;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not create canvas context');
    }

    context.drawImage(image, 0, 0, targetCanvasSize, targetCanvasSize);

    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error('Could not create PNG blob'));
      }, 'image/png');
    });

    downloadBlob(pngBlob, `circular-plot-${targetCanvasSize}px.png`);
    exportError.value = '';
  } catch {
    exportError.value = 'Could not export the plot as PNG';
  } finally {
    if (svgUrl) {
      URL.revokeObjectURL(svgUrl);
    }
  }
}

function openImportDialog() {
  fileInput.value?.click();
}

async function importStateFile(file) {
  if (!file) {
    return;
  }

  try {
    const fileContent = await file.text();
    const state = parseCircularPlotState(fileContent);
    applyImportedState(state);
    importError.value = '';
  } catch {
    importError.value = 'Could not load the dropped file';
  }
}

async function onImportFileChange(event) {
  const [selectedFile] = event.target.files || [];
  await importStateFile(selectedFile);
  event.target.value = '';
}

function onFileDragOver(event) {
  if (!event.dataTransfer?.types.includes('Files')) {
    return;
  }
  event.preventDefault();
}

function onFileDragEnter(event) {
  if (!event.dataTransfer?.types.includes('Files')) {
    return;
  }
  event.preventDefault();
  dragEventDepth.value += 1;
  isDraggingStateFile.value = true;
}

function onFileDragLeave(event) {
  if (!event.dataTransfer?.types.includes('Files')) {
    return;
  }
  event.preventDefault();
  dragEventDepth.value = Math.max(0, dragEventDepth.value - 1);
  if (dragEventDepth.value === 0) {
    isDraggingStateFile.value = false;
  }
}

async function onFileDrop(event) {
  if (!event.dataTransfer?.types.includes('Files')) {
    return;
  }
  event.preventDefault();
  dragEventDepth.value = 0;
  isDraggingStateFile.value = false;
  const [droppedFile] = event.dataTransfer?.files || [];
  await importStateFile(droppedFile);
}
</script>

<template>
  <div
      :class="{ 'circular-plot-page--drop-active': isDraggingStateFile }"
      class="circular-plot-page"
      @dragenter="onFileDragEnter"
      @dragleave="onFileDragLeave"
      @dragover="onFileDragOver"
      @drop="onFileDrop"
  >
    <h2 class="text-h4 mb-2 mt-0">Circular Plot</h2>
    <p class="mb-4">
      This page can be used to produce a circular plot with variable cycle length and binning.
    </p>
    <v-divider class="mb-6"/>

    <div ref="plotContainer">
      <CircularPlotCanvas v-model:config="configModel" v-model:data="dataModel" @stats-change="updateStats"/>
    </div>

    <v-alert v-if="plotStats.dataPointCount > 0" class="stats-summary" type="info" variant="tonal">
      <a href="https://en.wikipedia.org/wiki/Circular_mean" rel="noopener noreferrer"
         target="_blank" @click.stop>Circular mean</a> is <strong>{{ plotStats.circularMean }}</strong>, vector
      magnitude is
      <strong>{{ plotStats.vectorMagnitude }}</strong>, there were
      <strong>{{ plotStats.dataPointCount }}</strong> data points.
    </v-alert>

    <div class="plot-actions mt-3">
      <div class="plot-actions__exports">
        <v-btn color="primary" variant="outlined" @click="exportPlotAsSvg">Export SVG</v-btn>
        <v-menu>
          <template #activator="{ props }">
            <v-btn append-icon="mdi-menu-down" color="primary" v-bind="props" variant="outlined">Export PNG</v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
                v-for="size in pngExportSizes"
                :key="`png-size-${size}`"
                :title="`${size}px`"
                @click="exportPlotAsPng(size)"
            />
          </v-list>
        </v-menu>
      </div>

      <div class="plot-actions__state">
        <v-btn color="primary" @click="exportStateToFile">Save plot file</v-btn>
        <v-btn variant="outlined" @click="openImportDialog">Load plot file</v-btn>
        <input
            ref="fileInput"
            accept="application/json,.json"
            class="state-file-input"
            type="file"
            @change="onImportFileChange"
        >
      </div>
    </div>
    <v-alert v-if="importError" class="mb-3" type="error" variant="tonal">{{ importError }}</v-alert>
    <v-alert v-if="exportError" class="mt-3" type="error" variant="tonal">{{ exportError }}</v-alert>


    <v-divider class="my-6"/>
    <h3 class="text-h5 mb-2">Data</h3>
    <v-textarea
        v-model="dataAsString"
        placeholder="Enter comma-separated integer/floating-point data"
        rows="4"
        variant="outlined"
    />
    <div class="config-grid mb-4">
      <v-text-field
          v-for="(label, key) in dataKeys"
          :key="key"
          v-model.number="plotConfig[key]"
          :label="label || key"
          density="comfortable"
          type="number"
          variant="outlined"
      />
    </div>

    <v-divider class="my-6"/>
    <h3 class="text-h5 mb-4">Display Configuration</h3>
    <div class="config-grid mb-4">
      <v-text-field
          v-for="(label, key) in numericKeys"
          :key="key"
          v-model.number="plotConfig[key]"
          :label="label || key"
          density="comfortable"
          type="number"
          variant="outlined"
      />
    </div>

    <div class="config-grid">
      <v-text-field
          v-for="(label, key) in colorKeys"
          :key="key"
          v-model="plotConfig[key]"
          :label="label || key"
          density="comfortable"
          type="color"
          variant="outlined"
      />
    </div>

    <div class="config-grid mt-4">
      <v-switch
          v-for="(label, key) in booleanKeys"
          :key="key"
          v-model="plotConfig[key]"
          :label="label || key"
          color="primary"
      />
    </div>
  </div>
</template>

<style scoped>
.circular-plot-page {
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.circular-plot-page--drop-active {
  background-color: rgba(25, 118, 210, 0.08);
}

.stats-summary {
  margin-top: 1rem;
}

.plot-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.plot-actions__exports,
.plot-actions__state {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.plot-actions__state {
  margin-left: auto;
}

.config-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.state-file-input {
  display: none;
}

.state-drop-hint {
  color: rgba(0, 0, 0, 0.7);
}
</style>
