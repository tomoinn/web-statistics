import { describe, expect, it } from 'vitest';
import {
  calculateCircularStats,
  normalizeConfig,
  normalizeDataArray,
  normalizeNumber,
  parseCircularPlotState,
  parseDataInput,
  serializeCircularPlotState
} from './circularPlot';

describe('circular plot utilities', () => {
  it('parses numeric data and ignores invalid tokens', () => {
    expect(parseDataInput('1, 2.5, foo, 3, , bar')).toEqual([1, 2.5, 3]);
  });

  it('normalizes numeric values with defaults and precision', () => {
    expect(normalizeNumber('2.349', { precision: 2, defaultValue: 1 })).toBe(2.35);
    expect(normalizeNumber('nope', { precision: 0, defaultValue: 9 })).toBe(9);
    expect(normalizeConfig({ binSize: '0.3333' }).binSize).toBe(0.33);
    expect(normalizeConfig({}).canvasSize).toBeUndefined();
    expect(normalizeConfig({}).mainAxisRadius).toBeUndefined();
  });

  it('normalizes showHourNumbers as a boolean option', () => {
    expect(normalizeConfig({}).showHourNumbers).toBe(true);
    expect(normalizeConfig({ showHourNumbers: true }).showHourNumbers).toBe(true);
    expect(normalizeConfig({ showHourNumbers: '1' }).showHourNumbers).toBe(true);
    expect(normalizeConfig({ showHourNumbers: 'false' }).showHourNumbers).toBe(false);
    expect(normalizeConfig({ showHourNumbers: '' }).showHourNumbers).toBe(false);
  });

  it('calculates circular statistics', () => {
    const stats = calculateCircularStats([0, 6, 12, 18], 24);
    expect(stats.dataPointCount).toBe(4);
    expect(stats.circularMean).not.toBeNull();
    expect(stats.vectorMagnitude).toBeGreaterThanOrEqual(0);
  });

  it('normalizes data arrays for state import', () => {
    expect(normalizeDataArray([1, '2.5', 'foo', null, 3])).toEqual([1, 2.5, 3]);
    expect(normalizeDataArray('not-an-array')).toEqual([]);
  });

  it('serializes and parses circular plot state', () => {
    const serialized = serializeCircularPlotState({ binSize: '0.3333', showHourNumbers: '1', canvasSize: 900, mainAxisRadius: 123 }, [1, '2.2', 'foo']);
    const parsed = parseCircularPlotState(serialized);

    expect(parsed.config.binSize).toBe(0.33);
    expect(parsed.config.showHourNumbers).toBe(true);
    expect(parsed.config.canvasSize).toBeUndefined();
    expect(parsed.config.mainAxisRadius).toBeUndefined();
    expect(parsed.data).toEqual([1, 2.2]);
  });

  it('rejects invalid serialized state root values', () => {
    expect(() => parseCircularPlotState('[]')).toThrow();
  });
});
