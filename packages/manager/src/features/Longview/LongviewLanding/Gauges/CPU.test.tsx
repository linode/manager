import { normalizeValue, sumCPUUsage } from './CPU';

import type { CPU } from '../../request.types';

describe('CPU Gauge', () => {
  describe('sumCPUUSage', () => {
    const cpuData: Record<string, CPU> = {
      cpu0: {
        system: [{ x: 0, y: 2 }],
        user: [{ x: 0, y: 1 }],
        wait: [{ x: 0, y: 3 }],
      },
    };
    it('sums CPU usage given data', () => {
      expect(sumCPUUsage(cpuData)).toBe(6);
    });
    it('works with multiple CPUs', () => {
      const data = {
        ...cpuData,
        cpu1: {
          system: [{ x: 0, y: 2 }],
          user: [{ x: 0, y: 1 }],
          wait: [{ x: 0, y: 3 }],
        },
      };
      expect(sumCPUUsage(data)).toBe(12);
    });
    it('returns 0 if data is malformed', () => {
      expect(sumCPUUsage({})).toBe(0);
      expect(sumCPUUsage({ cpu0: {} as any })).toBe(0);
      expect(sumCPUUsage({ cpu0: { user: undefined } as any })).toBe(0);
      expect(sumCPUUsage({ cpu0: { user: null } as any })).toBe(0);
      expect(
        sumCPUUsage({ cpu0: { system: null, user: [], wait: 1 } as any })
      ).toBe(0);
    });
  });

  describe('normalizeValue utility', () => {
    it('should clamp the value between 0 and 100', () => {
      expect(normalizeValue(-1, 1)).toBe(0);
      expect(normalizeValue(0, 1)).toBe(0);
      expect(normalizeValue(50, 1)).toBe(50);
      expect(normalizeValue(100, 1)).toBe(100);
      expect(normalizeValue(101, 1)).toBe(100);
    });
    it('rounds the result', () => {
      expect(normalizeValue(49.99, 1)).toBe(50);
      expect(normalizeValue(99.01, 1)).toBe(99);
    });
    it('should clamp max based on number of cores', () => {
      expect(normalizeValue(150, 1)).toBe(100);
      expect(normalizeValue(150, 2)).toBe(150);
      expect(normalizeValue(-50, 1)).toBe(0);
      expect(normalizeValue(-50, 2)).toBe(0);
    });
  });
});
