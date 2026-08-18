export const DEFAULT_CONFIG = {
  lengthOfDay: 24,
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
  showHourNumbers: true
};

const NUMERIC_RULES = {
  lengthOfDay: { precision: 2, defaultValue: 24 },
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
  blobSep: { precision: 0, defaultValue: 5 }
};

const BOOLEAN_RULES = {
  showHourNumbers: { defaultValue: false }
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
  const normalized = {};

  Object.keys(DEFAULT_CONFIG).forEach((key) => {
    normalized[key] = merged[key];
  });

  Object.entries(NUMERIC_RULES).forEach(([key, rule]) => {
    normalized[key] = normalizeNumber(merged[key], rule);
  });

  Object.entries(BOOLEAN_RULES).forEach(([key, rule]) => {
    const value = merged[key];
    if (typeof value === 'boolean') {
      normalized[key] = value;
      return;
    }

    if (typeof value === 'string') {
      const normalizedString = value.trim().toLowerCase();
      if (normalizedString === 'true' || normalizedString === '1') {
        normalized[key] = true;
        return;
      }
      if (normalizedString === 'false' || normalizedString === '0' || normalizedString === '') {
        normalized[key] = false;
        return;
      }
    }

    normalized[key] = value === null || value === undefined ? rule.defaultValue : Boolean(value);
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

export function normalizeDataArray(dataInput) {
  if (!Array.isArray(dataInput)) {
    return [];
  }

  return dataInput
    .map((value) => (typeof value === 'number' ? value : parseFloat(value)))
    .filter((value) => !Number.isNaN(value));
}

export function serializeCircularPlotState(configInput, dataInput) {
  return JSON.stringify({
    config: normalizeConfig(configInput || {}),
    data: normalizeDataArray(dataInput)
  });
}

export function parseCircularPlotState(serializedState) {
  const parsed = JSON.parse(serializedState);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid circular plot state');
  }

  return {
    config: normalizeConfig(parsed.config || {}),
    data: normalizeDataArray(parsed.data)
  };
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
