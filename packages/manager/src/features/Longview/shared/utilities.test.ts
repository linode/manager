import {
  appendStats,
  formatBitsPerSecond,
  generateNetworkUnits,
  generateTotalMemory,
  generateUsedMemory,
  statAverage,
  statMax,
  sumCPU,
  sumNetwork,
  sumStatsObject,
} from './utilities';

import type {
  CPU,
  InboundOutboundNetwork,
  LongviewNetwork,
  Stat,
} from '../request.types';

const generateStats = (yValues: number[]): Stat[] => {
  return yValues.map((n) => ({ x: 0, y: n }));
};

describe('Utility Functions', () => {
  it('should generate used memory correctly', () => {
    expect(generateUsedMemory(400, 100, 100)).toBe(200);
    expect(generateUsedMemory(0, 100, 100)).toBe(0);
    expect(generateUsedMemory(1000, 100, 100)).toBe(800);
  });

  it('should generate total memory correctly', () => {
    expect(generateTotalMemory(100, 400)).toBe(500);
    expect(generateTotalMemory(500, 400)).toBe(900);
    expect(generateTotalMemory(100, 900)).toBe(1000);
  });

  describe('statAverage', () => {
    it('returns the average', () => {
      let data = generateStats([1, 2, 3]);
      expect(statAverage(data)).toBe(2);
      data = generateStats([1, 1]);
      expect(statAverage(data)).toBe(1);
      data = generateStats([1, 10]);
      expect(statAverage(data)).toBe(5.5);
      data = generateStats([1]);
      expect(statAverage(data)).toBe(1);
    });

    it('handles empty input', () => {
      expect(statAverage()).toBe(0);
    });
  });

  describe('statMax', () => {
    it('returns the max', () => {
      let data = generateStats([1, 2, 3]);
      expect(statMax(data)).toBe(3);
      data = generateStats([1, 1]);
      expect(statMax(data)).toBe(1);
      data = generateStats([10, 1]);
      expect(statMax(data)).toBe(10);
      data = generateStats([1]);
      expect(statMax(data)).toBe(1);
      data = generateStats([-1, 0]);
      expect(statMax(data)).toBe(0);
      data = generateStats([-1, 5]);
      expect(statMax(data)).toBe(5);
    });

    it('handles empty input', () => {
      expect(statMax()).toBe(0);
    });
  });

  describe('generateNetworkStats', () => {
    it('should generate the correct units and values', () => {
      const oneKilobit = 1000;
      const oneMegabit = 1000000;
      expect(generateNetworkUnits(oneKilobit)).toEqual('Kb');
      expect(generateNetworkUnits(oneMegabit)).toEqual('Mb');
      expect(generateNetworkUnits(100)).toEqual('b');
    });
  });

  describe('sumCPU', () => {
    const mockCPU: CPU = {
      system: generateStats([1]),
      user: generateStats([2]),
      wait: generateStats([3]),
    };

    it('sums `system`, `user`, and `wait` stats (Y values) for each CPU', () => {
      const mockData: Record<string, CPU> = {
        cpu0: mockCPU,
        cpu1: mockCPU,
        cpu2: mockCPU,
      };
      const result = sumCPU(mockData);

      expect(result.system[0].y).toBe(3);
      expect(result.user[0].y).toBe(6);
      expect(result.wait[0].y).toBe(9);
    });

    it('returns stats untouched if there is only one CPU', () => {
      const mockData: Record<string, CPU> = { cpu0: mockCPU };
      const result = sumCPU(mockData);

      expect(result.system[0].y).toBe(1);
      expect(result.user[0].y).toBe(2);
      expect(result.wait[0].y).toBe(3);
    });

    it('leaves X values untouched', () => {
      const mockStats = [{ x: 100, y: 1 }];
      const mockData: Record<string, CPU> = {
        cpu0: {
          system: mockStats,
          user: mockStats,
          wait: mockStats,
        },
      };
      const result = sumCPU(mockData);

      expect(result.system[0].x).toBe(100);
      expect(result.user[0].x).toBe(100);
      expect(result.wait[0].x).toBe(100);
    });

    it('works if stat arrays are of different lengths', () => {
      const mockData: Record<string, CPU> = {
        cpu0: {
          system: [
            { x: 0, y: 1 },
            { x: 0, y: 1 },
          ],
          user: [],
          wait: [],
        },
        cpu1: mockCPU,
      };
      const result = sumCPU(mockData);
      expect(result.system).toHaveLength(2);
      expect(result.system[0].y).toBe(2);
      expect(result.user).toHaveLength(1);
      expect(result.wait).toHaveLength(1);
    });

    it('gracefully fails when given malformed data', () => {
      const emptyCPU = { system: [], user: [], wait: [] };

      expect(sumCPU({} as any)).toEqual(emptyCPU);
      expect(sumCPU([] as any)).toEqual(emptyCPU);
      expect(sumCPU(null as any)).toEqual(emptyCPU);
      expect(sumCPU(undefined as any)).toEqual(emptyCPU);
    });
  });

  describe('sumNetwork', () => {
    const mockNetworkInterface: InboundOutboundNetwork = {
      rx_bytes: generateStats([1]),
      tx_bytes: generateStats([2]),
    };

    it('sums `rx_bytes` and `tx_bytes` for each Network Interface', () => {
      const mockData: LongviewNetwork['Network']['Interface'] = {
        eth0: mockNetworkInterface,
        eth1: mockNetworkInterface,
        eth2: mockNetworkInterface,
      };
      const result = sumNetwork(mockData);

      expect(result.rx_bytes[0].y).toBe(3);
      expect(result.tx_bytes[0].y).toBe(6);
    });

    it('returns stats untouched if there is only one Network Interface', () => {
      const mockData: Record<string, InboundOutboundNetwork> = {
        eth0: mockNetworkInterface,
      };
      const result = sumNetwork(mockData);

      expect(result.rx_bytes[0].y).toBe(1);
      expect(result.tx_bytes[0].y).toBe(2);
    });

    it('leaves X values untouched', () => {
      const mockStats = [{ x: 100, y: 1 }];
      const mockData: Record<string, InboundOutboundNetwork> = {
        cpu0: {
          rx_bytes: mockStats,
          tx_bytes: mockStats,
        },
      };
      const result = sumNetwork(mockData);

      expect(result.rx_bytes[0].x).toBe(100);
      expect(result.tx_bytes[0].x).toBe(100);
    });

    it('works if stat arrays are of different lengths', () => {
      const mockData: Record<string, InboundOutboundNetwork> = {
        eth0: {
          rx_bytes: [
            { x: 0, y: 1 },
            { x: 0, y: 1 },
          ],
          tx_bytes: [],
        },
        eth1: mockNetworkInterface,
      };
      const result = sumNetwork(mockData);
      expect(result.rx_bytes).toHaveLength(2);
      expect(result.tx_bytes[0].y).toBe(2);
    });

    it('gracefully fails when given malformed data', () => {
      const emptyNetworkInterface = { rx_bytes: [], tx_bytes: [] };

      expect(sumNetwork({} as any)).toEqual(emptyNetworkInterface);
      expect(sumNetwork([] as any)).toEqual(emptyNetworkInterface);
      expect(sumNetwork(null as any)).toEqual(emptyNetworkInterface);
      expect(sumNetwork(undefined as any)).toEqual(emptyNetworkInterface);
    });
  });

  describe('appendStats', () => {
    it('sums Y values if X values are equal', () => {
      const a = [
        { x: 1, y: 10 },
        { x: 2, y: 100 },
      ];
      const b = [
        { x: 1, y: 20 },
        { x: 2, y: 200 },
      ];
      const result = appendStats(a, b);
      expect(result[0].y).toBe(30);
      expect(result[1].y).toBe(300);
    });
    it('sums Y values correctly when values are 0', () => {
      const a = [{ x: 1, y: 0 }];
      const b = [{ x: 1, y: 10 }];
      const result = appendStats(a, b);
      expect(result[0].y).toBe(10);
    });
  });

  describe('sumStatsObject', () => {
    const mockNetworkInterface: InboundOutboundNetwork = {
      rx_bytes: generateStats([1]),
      tx_bytes: generateStats([2]),
    };
    const emptyState = {
      rx_bytes: [],
      tx_bytes: [],
    };

    it('sums all sub-fields for a given data set', () => {
      const mockData: LongviewNetwork['Network']['Interface'] = {
        eth0: mockNetworkInterface,
        eth1: mockNetworkInterface,
        eth2: mockNetworkInterface,
      };
      const result = sumStatsObject<InboundOutboundNetwork>(
        mockData,
        emptyState
      );

      expect(result.rx_bytes[0].y).toBe(3);
      expect(result.tx_bytes[0].y).toBe(6);
    });

    it('returns stats untouched if there is only one provided object', () => {
      const mockData: Record<string, InboundOutboundNetwork> = {
        eth0: mockNetworkInterface,
      };
      const result = sumStatsObject<InboundOutboundNetwork>(
        mockData,
        emptyState
      );

      expect(result.rx_bytes[0].y).toBe(1);
      expect(result.tx_bytes[0].y).toBe(2);
    });

    it('leaves X values untouched', () => {
      const mockStats = [{ x: 100, y: 1 }];
      const mockData: Record<string, InboundOutboundNetwork> = {
        cpu0: {
          rx_bytes: mockStats,
          tx_bytes: mockStats,
        },
      };
      const result = sumStatsObject<InboundOutboundNetwork>(
        mockData,
        emptyState
      );

      expect(result.rx_bytes[0].x).toBe(100);
      expect(result.tx_bytes[0].x).toBe(100);
    });

    it('works if stat arrays are of different lengths', () => {
      const mockData: Record<string, InboundOutboundNetwork> = {
        eth0: {
          rx_bytes: [
            { x: 0, y: 1 },
            { x: 0, y: 1 },
          ],
          tx_bytes: [],
        },
        eth1: mockNetworkInterface,
      };
      const result = sumStatsObject<InboundOutboundNetwork>(
        mockData,
        emptyState
      );
      expect(result.rx_bytes).toHaveLength(2);
      expect(result.tx_bytes[0].y).toBe(2);
    });

    it('gracefully fails when given malformed data', () => {
      const emptyNetworkInterface = { rx_bytes: [], tx_bytes: [] };

      expect(sumStatsObject({} as any, emptyState)).toEqual(
        emptyNetworkInterface
      );
      expect(sumStatsObject([] as any, emptyState)).toEqual(
        emptyNetworkInterface
      );
      expect(sumStatsObject(null as any, emptyState)).toEqual(
        emptyNetworkInterface
      );
      expect(sumStatsObject(undefined as any, emptyState)).toEqual(
        emptyNetworkInterface
      );
    });

    it('defaults to {} when emptyState is not provided', () => {
      expect(sumStatsObject({})).toEqual({});
      expect(sumStatsObject(undefined as any)).toEqual({});
    });

    it('handles arbitrary data shapes', () => {
      const weirdData = {
        series1: {
          apples: generateStats([1]),
          oranges: generateStats([2]),
          pears: generateStats([3]),
        },
        series2: {
          apples: generateStats([1]),
          oranges: generateStats([2]),
          pears: generateStats([3]),
        },
      };
      const result = sumStatsObject<any>(weirdData);
      expect(result).toHaveProperty('apples');
      expect(result).toHaveProperty('oranges');
      expect(result).toHaveProperty('pears');
      expect(result.apples[0].y).toEqual(2);
      expect(result.pears[0].y).toEqual(6);
    });
  });
  describe('formatBitsPerSecond', () => {
    it('adds unit', () => {
      expect(formatBitsPerSecond(12)).toBe('12 b/s');
      expect(formatBitsPerSecond(0)).toBe('0 b/s');
      expect(formatBitsPerSecond(123456789)).toBe('123.46 Mb/s');
    });
  });
});
