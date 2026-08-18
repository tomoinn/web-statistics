import tinycolor from 'tinycolor2';

export const DEFAULT_CONFIG = {
  lengthOfDay: 24,
  mainAxisRadius: 200,
  mainAxisWidth: 2,
  mainAxisColour: '#333333',
  axisTickWidth: 1,
  axisTickColour: '#333333',
  axisTickLength: 6,
  binTickWidth: 1,
  binTickColour: '#777777',
  binTickSize: 4,
  binSize: 0.25,
  blobColour: '#d9edf7',
  modalBlobColour: '#fcf8e3',
  meanBlobColour: '#dff0d8',
  meanBlobSize: 20,
  magnitudeBlobColour: '#f2dede',
  magnitudeBlobSize: 15,
  magnitudeLineWidth: 2,
  blobLineWidth: 2,
  blobSize: 10,
  blobSep: 5,
  canvasSize: 500
};

const NUMERIC_RULES = {
  lengthOfDay: { precision: 2, defaultValue: 24 },
  mainAxisRadius: { precision: 0, defaultValue: 200 },
  mainAxisWidth: { precision: 0, defaultValue: 2 },
  axisTickWidth: { precision: 0, defaultValue: 1 },
  axisTickLength: { precision: 0, defaultValue: 6 },
  binTickWidth: { precision: 0, defaultValue: 1 },
  binTickSize: { precision: 0, defaultValue: 4 },
  binSize: { precision: 2, defaultValue: 0.25 },
  meanBlobSize: { precision: 0, defaultValue: 20 },
  magnitudeBlobSize: { precision: 0, defaultValue: 15 },
  magnitudeLineWidth: { precision: 0, defaultValue: 2 },
  blobLineWidth: { precision: 0, defaultValue: 2 },
  blobSize: { precision: 0, defaultValue: 10 },
  blobSep: { precision: 0, defaultValue: 5 },
  canvasSize: { precision: 0, defaultValue: 500 }
};

export function normalizeNumber(value, spec) {
  const precision = spec.precision ?? 0;
  const defaultValue = spec.defaultValue ?? 1;
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const roundingMultiplier = 10 ** precision;
  const numericValue = Number.isNaN(Number(value)) ? defaultValue : parseFloat(value);
  return Math.round(numericValue * roundingMultiplier) / roundingMultiplier;
}

export function normalizeConfig(configInput = {}) {
  const merged = { ...DEFAULT_CONFIG, ...configInput };
  const normalized = { ...merged };

  Object.entries(NUMERIC_RULES).forEach(([key, rule]) => {
    normalized[key] = normalizeNumber(merged[key], rule);
  });

  return normalized;
}

export function parseDataInput(dataAsString) {
  if (!dataAsString) {
    return [];
  }
  return dataAsString
    .split(',')
    .map((value) => parseFloat(value))
    .filter((value) => !Number.isNaN(value));
}

function circularMean(sumOfSin, sumOfCos) {
  let mean = Math.atan(sumOfSin / sumOfCos);
  if (sumOfCos < 0) {
    mean += Math.PI;
  } else if (sumOfSin < 0 && sumOfCos > 0) {
    mean += Math.PI * 2;
  }
  return mean;
}

export function calculateCircularStats(data, lengthOfDay) {
  let validDataPoints = 0;
  let sumOfSin = 0;
  let sumOfCos = 0;

  data.forEach((value) => {
    if (!Number.isNaN(value)) {
      validDataPoints += 1;
      sumOfSin += Math.sin((Math.PI * 2 * value) / lengthOfDay);
      sumOfCos += Math.cos((Math.PI * 2 * value) / lengthOfDay);
    }
  });

  if (validDataPoints === 0) {
    return {
      circularMean: null,
      vectorMagnitude: null,
      dataPointCount: 0
    };
  }

  const meanHour = (circularMean(sumOfSin, sumOfCos) / (Math.PI * 2)) * lengthOfDay;
  const vectorMagnitude = Math.sqrt((sumOfSin / validDataPoints) ** 2 + (sumOfCos / validDataPoints) ** 2);

  return {
    circularMean: meanHour,
    vectorMagnitude,
    dataPointCount: validDataPoints
  };
}

export function drawCircularPlot(canvas, configInput, dataInput) {
  const ctx = canvas.getContext('2d');
  const config = normalizeConfig(configInput);
  const data = dataInput.filter((value) => !Number.isNaN(value));

  const hourToRadians = (hour) => (Math.PI * 2 * hour) / config.lengthOfDay;
  const radiansToHours = (radians) => (radians / (Math.PI * 2)) * config.lengthOfDay;
  const polarToCart = (hour, offset) => {
    const radians = hourToRadians(hour) - Math.PI / 2;
    const radius = config.mainAxisRadius + offset;
    return {
      x: radius * Math.cos(radians),
      y: radius * Math.sin(radians)
    };
  };

  const drawBlob = (coordinates, radius, colour = config.blobColour) => {
    ctx.save();
    ctx.strokeStyle = tinycolor(colour).darken(50).toHexString();
    ctx.fillStyle = tinycolor(colour).toHexString();
    ctx.lineWidth = config.blobLineWidth;
    ctx.beginPath();
    ctx.arc(coordinates.x, coordinates.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  };

  const resolution = window.devicePixelRatio || 1;
  canvas.width = config.canvasSize * resolution;
  canvas.height = config.canvasSize * resolution;
  canvas.style.width = `${config.canvasSize}px`;
  canvas.style.height = `${config.canvasSize}px`;

  ctx.setTransform(resolution, 0, 0, resolution, config.canvasSize / 2, config.canvasSize / 2);

  ctx.save();
  ctx.strokeStyle = config.mainAxisColour;
  ctx.lineWidth = config.mainAxisWidth;
  ctx.beginPath();
  ctx.arc(0, 0, config.mainAxisRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.closePath();
  ctx.strokeStyle = config.axisTickColour;
  ctx.lineWidth = config.axisTickWidth;
  for (let hour = 0; hour < config.lengthOfDay; hour += 1) {
    const from = polarToCart(hour, config.mainAxisWidth / 2);
    const to = polarToCart(hour, config.mainAxisWidth / 2 + config.axisTickLength);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.closePath();
  }
  ctx.strokeStyle = config.binTickColour;
  ctx.lineWidth = config.binTickWidth;
  for (let binHour = 0; binHour < config.lengthOfDay; binHour += config.binSize) {
    const tickFrom = polarToCart(binHour, -config.mainAxisWidth / 2);
    const tickTo = polarToCart(binHour, -(config.binTickSize + config.mainAxisWidth / 2));
    ctx.beginPath();
    ctx.moveTo(tickFrom.x, tickFrom.y);
    ctx.lineTo(tickTo.x, tickTo.y);
    ctx.stroke();
    ctx.closePath();
  }
  ctx.restore();

  const hist = new Array(config.lengthOfDay / config.binSize).fill(0);
  let validDataPoints = 0;
  let sumOfSin = 0;
  let sumOfCos = 0;
  let maxCount = 0;

  data.forEach((value) => {
    const point = value % config.lengthOfDay;
    validDataPoints += 1;
    const bin = Math.floor((value / config.binSize) % (config.lengthOfDay / config.binSize));
    hist[bin] += 1;
    maxCount = Math.max(maxCount, hist[bin]);
    sumOfSin += Math.sin(hourToRadians(point));
    sumOfCos += Math.cos(hourToRadians(point));
  });

  hist.forEach((binCount, binIndex) => {
    const colour = binCount === maxCount ? config.modalBlobColour : config.blobColour;
    const binHour = (binIndex + 0.5) * config.binSize;
    for (let count = 0; count < binCount; count += 1) {
      drawBlob(
        polarToCart(binHour, -(count * (config.blobSize + config.blobSep) + config.blobSep + config.blobSize / 2)),
        config.blobSize / 2,
        colour
      );
    }
  });

  const stats = {
    circularMean: null,
    vectorMagnitude: null,
    dataPointCount: validDataPoints
  };

  if (validDataPoints > 0) {
    const meanHour = radiansToHours(circularMean(sumOfSin, sumOfCos));
    const magnitude = Math.sqrt((sumOfSin / validDataPoints) ** 2 + (sumOfCos / validDataPoints) ** 2);
    const meanPoint = polarToCart(meanHour, 0);
    const magnitudePoint = polarToCart(meanHour, -(1 - magnitude) * config.mainAxisRadius);

    ctx.save();
    ctx.strokeStyle = tinycolor(config.magnitudeBlobColour).darken(50).toHexString();
    ctx.lineWidth = config.magnitudeLineWidth;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(magnitudePoint.x, magnitudePoint.y);
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = config.mainAxisColour;
    ctx.beginPath();
    ctx.moveTo(magnitudePoint.x, magnitudePoint.y);
    ctx.lineTo(meanPoint.x, meanPoint.y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    drawBlob(meanPoint, config.meanBlobSize / 2, config.meanBlobColour);
    drawBlob(magnitudePoint, config.magnitudeBlobSize / 2, config.magnitudeBlobColour);

    stats.circularMean = meanHour;
    stats.vectorMagnitude = magnitude;
  }

  return stats;
}
