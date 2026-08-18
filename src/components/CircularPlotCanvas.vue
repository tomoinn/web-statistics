<script setup>
import { computed, watch } from 'vue';
import tinycolor from 'tinycolor2';
import { DEFAULT_CONFIG, normalizeConfig } from '../utils/circularPlot';

const configModel = defineModel('config', {
  type: Object,
  required: true
});

const dataModel = defineModel('data', {
  type: Array,
  required: true
});

const emit = defineEmits(['stats-change']);

const PLOT_CANVAS_SIZE = 500;
const MAIN_AXIS_RADIUS = 200;

function circularMean(sumOfSin, sumOfCos) {
  let mean = Math.atan(sumOfSin / sumOfCos);
  if (sumOfCos < 0) {
    mean += Math.PI;
  } else if (sumOfSin < 0 && sumOfCos > 0) {
    mean += Math.PI * 2;
  }
  return mean;
}

function darkenColour(colour) {
  return tinycolor(colour).darken(50).toHexString();
}

function getPositiveModulo(value, modulo) {
  return ((value % modulo) + modulo) % modulo;
}

function hourToRadians(hour, lengthOfDay) {
  return (Math.PI * 2 * hour) / lengthOfDay;
}

function radiansToHours(radians, lengthOfDay) {
  return (radians / (Math.PI * 2)) * lengthOfDay;
}

function polarToCart(config, hour, offset) {
  const radians = hourToRadians(hour, config.lengthOfDay) - Math.PI / 2;
  const radius = MAIN_AXIS_RADIUS + offset;
  return {
    x: radius * Math.cos(radians),
    y: radius * Math.sin(radians)
  };
}

const normalizedConfig = computed(() => normalizeConfig(configModel.value));

const normalizedData = computed(() => (
  Array.isArray(dataModel.value)
    ? dataModel.value.filter((value) => !Number.isNaN(value))
    : []
));

const plot = computed(() => {
  const config = normalizedConfig.value;
  const data = normalizedData.value;
  const safeLengthOfDay = config.lengthOfDay > 0 ? config.lengthOfDay : DEFAULT_CONFIG.lengthOfDay;
  const safeBinSize = config.binSize > 0 ? config.binSize : DEFAULT_CONFIG.binSize;
  const binCount = Math.max(1, Math.round(safeLengthOfDay / safeBinSize));

  const axisTicks = [];
  for (let hour = 0; hour < safeLengthOfDay; hour += 1) {
    const from = polarToCart(config, hour, config.mainAxisWidth / 2);
    const to = polarToCart(config, hour, config.mainAxisWidth / 2 + config.axisTickLength);
    axisTicks.push({ from, to });
  }

  const hourLabels = [];
  if (config.showHourNumbers) {
    for (let hour = 0; hour < safeLengthOfDay; hour += 1) {
      const position = polarToCart(config, hour, config.mainAxisWidth / 2 + config.axisTickLength + 14);
      hourLabels.push({
        hour,
        x: position.x,
        y: position.y
      });
    }
  }

  const binTicks = [];
  for (let binHour = 0; binHour < safeLengthOfDay; binHour += safeBinSize) {
    const from = polarToCart(config, binHour, -config.mainAxisWidth / 2);
    const to = polarToCart(config, binHour, -(config.binTickSize + config.mainAxisWidth / 2));
    binTicks.push({ from, to });
  }

  const histogram = new Array(binCount).fill(0);
  let validDataPoints = 0;
  let sumOfSin = 0;
  let sumOfCos = 0;
  let maxCount = 0;

  data.forEach((value) => {
    const point = getPositiveModulo(value, safeLengthOfDay);
    const bin = Math.floor(point / safeBinSize) % binCount;
    validDataPoints += 1;
    histogram[bin] += 1;
    maxCount = Math.max(maxCount, histogram[bin]);
    sumOfSin += Math.sin(hourToRadians(point, safeLengthOfDay));
    sumOfCos += Math.cos(hourToRadians(point, safeLengthOfDay));
  });

  const blobs = [];
  histogram.forEach((binValue, index) => {
    const colour = binValue === maxCount ? config.modalBlobColour : config.blobColour;
    const binHour = (index + 0.5) * safeBinSize;
    for (let count = 0; count < binValue; count += 1) {
      const coordinates = polarToCart(
        config,
        binHour,
        -(count * (config.blobSize + config.blobSep) + config.blobSep + config.blobSize / 2)
      );
      blobs.push({
        x: coordinates.x,
        y: coordinates.y,
        radius: config.blobSize / 2,
        fill: tinycolor(colour).toHexString(),
        stroke: darkenColour(colour)
      });
    }
  });

  const stats = {
    circularMean: null,
    vectorMagnitude: null,
    dataPointCount: validDataPoints
  };

  let meanPoint = null;
  let magnitudePoint = null;

  if (validDataPoints > 0) {
    const meanHour = radiansToHours(circularMean(sumOfSin, sumOfCos), safeLengthOfDay);
    const magnitude = Math.sqrt((sumOfSin / validDataPoints) ** 2 + (sumOfCos / validDataPoints) ** 2);

    meanPoint = polarToCart(config, meanHour, 0);
    magnitudePoint = polarToCart(config, meanHour, -(1 - magnitude) * MAIN_AXIS_RADIUS);

    stats.circularMean = meanHour;
    stats.vectorMagnitude = magnitude;
  }

  return {
    axisTicks,
    hourLabels,
    binTicks,
    blobs,
    meanPoint,
    magnitudePoint,
    stats
  };
});

watch(() => plot.value.stats, (stats) => {
  emit('stats-change', stats);
}, { immediate: true, deep: true });
</script>

<template>
  <svg
    class="circular-plot"
    :width="PLOT_CANVAS_SIZE"
    :height="PLOT_CANVAS_SIZE"
    :viewBox="`0 0 ${PLOT_CANVAS_SIZE} ${PLOT_CANVAS_SIZE}`"
    style="background-color: transparent;"
  >
    <g :transform="`translate(${PLOT_CANVAS_SIZE / 2} ${PLOT_CANVAS_SIZE / 2})`">
      <circle
        cx="0"
        cy="0"
        :r="MAIN_AXIS_RADIUS"
        fill="none"
        :stroke="normalizedConfig.mainAxisColour"
        :stroke-width="normalizedConfig.mainAxisWidth"
      />

      <line
        v-for="(tick, index) in plot.axisTicks"
        :key="`axis-${index}`"
        :x1="tick.from.x"
        :y1="tick.from.y"
        :x2="tick.to.x"
        :y2="tick.to.y"
        :stroke="normalizedConfig.axisTickColour"
        :stroke-width="normalizedConfig.axisTickWidth"
      />

      <text
        v-for="label in plot.hourLabels"
        :key="`hour-${label.hour}`"
        :x="label.x"
        :y="label.y"
        :fill="normalizedConfig.axisTickColour"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {{ label.hour }}
      </text>

      <line
        v-for="(tick, index) in plot.binTicks"
        :key="`bin-${index}`"
        :x1="tick.from.x"
        :y1="tick.from.y"
        :x2="tick.to.x"
        :y2="tick.to.y"
        :stroke="normalizedConfig.binTickColour"
        :stroke-width="normalizedConfig.binTickWidth"
      />

      <line
        v-if="plot.magnitudePoint"
        x1="0"
        y1="0"
        :x2="plot.magnitudePoint.x"
        :y2="plot.magnitudePoint.y"
        :stroke="darkenColour(normalizedConfig.magnitudeBlobColour)"
        :stroke-width="normalizedConfig.magnitudeLineWidth"
      />
      <line
        v-if="plot.magnitudePoint && plot.meanPoint"
        :x1="plot.magnitudePoint.x"
        :y1="plot.magnitudePoint.y"
        :x2="plot.meanPoint.x"
        :y2="plot.meanPoint.y"
        :stroke="normalizedConfig.mainAxisColour"
        :stroke-width="normalizedConfig.magnitudeLineWidth"
      />

      <circle
        v-for="(blob, index) in plot.blobs"
        :key="`blob-${index}`"
        :cx="blob.x"
        :cy="blob.y"
        :r="blob.radius"
        :fill="blob.fill"
        :stroke="blob.stroke"
        :stroke-width="normalizedConfig.blobLineWidth"
      />

      <circle
        v-if="plot.meanPoint"
        :cx="plot.meanPoint.x"
        :cy="plot.meanPoint.y"
        :r="normalizedConfig.meanBlobSize / 2"
        :fill="normalizedConfig.meanBlobColour"
        :stroke="darkenColour(normalizedConfig.meanBlobColour)"
        :stroke-width="normalizedConfig.blobLineWidth"
      />
      <circle
        v-if="plot.magnitudePoint"
        :cx="plot.magnitudePoint.x"
        :cy="plot.magnitudePoint.y"
        :r="normalizedConfig.magnitudeBlobSize / 2"
        :fill="normalizedConfig.magnitudeBlobColour"
        :stroke="darkenColour(normalizedConfig.magnitudeBlobColour)"
        :stroke-width="normalizedConfig.blobLineWidth"
      />
    </g>
  </svg>
</template>

<style scoped>
.circular-plot {
  display: block;
  width: 100%;
  height: auto;
}
</style>
