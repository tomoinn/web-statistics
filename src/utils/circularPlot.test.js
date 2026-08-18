import { describe, expect, it } from 'vitest';
import { calculateCircularStats, normalizeConfig, normalizeNumber, parseDataInput } from './circularPlot';

describe('circular plot utilities', () => {
  it('parses numeric data and ignores invalid tokens', () => {
    expect(parseDataInput('1, 2.5, foo, 3, , bar')).toEqual([1, 2.5, 3]);
  });

  it('normalizes numeric values with defaults and precision', () => {
    expect(normalizeNumber('2.349', { precision: 2, defaultValue: 1 })).toBe(2.35);
    expect(normalizeNumber('nope', { precision: 0, defaultValue: 9 })).toBe(9);
    expect(normalizeConfig({ binSize: '0.3333' }).binSize).toBe(0.33);
  });

  it('calculates circular statistics', () => {
    const stats = calculateCircularStats([0, 6, 12, 18], 24);
    expect(stats.dataPointCount).toBe(4);
    expect(stats.circularMean).not.toBeNull();
    expect(stats.vectorMagnitude).toBeGreaterThanOrEqual(0);
  });
});
