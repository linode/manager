import {
  CPU,
  InboundOutboundNetwork,
  LongviewNetwork,
  Stat
} from '../request.types';
import {
  generateTotalMemory,
  generateUsedMemory,
  statAverage,
  statMax,
  sumCPU,
  sumNetwork
} from './utilities';

const generateStats = (yValues: number[]): Stat[] => {
  return yValues.map(n => ({ x: 0, y: n }));
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

  describe('sumCPU', () => {
    const mockCPU: CPU = {
      system: generateStats([1]),
      user: generateStats([2]),
      wait: generateStats([3])
    };

    it('sums `system`, `user`, and `wait` stats (Y values) for each CPU', () => {
      const mockData: Record<string, CPU> = {
        cpu0: mockCPU,
        cpu1: mockCPU,
        cpu2: mockCPU
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
          wait: mockStats
        }
      };
      const result = sumCPU(mockData);

      expect(result.system[0].x).toBe(100);
      expect(result.user[0].x).toBe(100);
      expect(result.wait[0].x).toBe(100);
    });

    it('works if stat arrays are of different lengths', () => {
      const mockData: Record<string, CPU> = {
        cpu0: {
          system: [{ x: 0, y: 1 }, { x: 0, y: 1 }],
          user: [],
          wait: []
        },
        cpu1: mockCPU
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
      tx_bytes: generateStats([2])
    };

    it('sums `rx_bytes` and `tx_bytes` for each Network Interface', () => {
      const mockData: LongviewNetwork['Network']['Interface'] = {
        eth0: mockNetworkInterface,
        eth1: mockNetworkInterface,
        eth2: mockNetworkInterface
      };
      const result = sumNetwork(mockData);

      expect(result.rx_bytes[0].y).toBe(3);
      expect(result.tx_bytes[0].y).toBe(6);
    });

    it('returns stats untouched if there is only one Network Interface', () => {
      const mockData: Record<string, InboundOutboundNetwork> = {
        eth0: mockNetworkInterface
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
          tx_bytes: mockStats
        }
      };
      const result = sumNetwork(mockData);

      expect(result.rx_bytes[0].x).toBe(100);
      expect(result.tx_bytes[0].x).toBe(100);
    });

    it('works if stat arrays are of different lengths', () => {
      const mockData: Record<string, InboundOutboundNetwork> = {
        eth0: {
          rx_bytes: [{ x: 0, y: 1 }, { x: 0, y: 1 }],
          tx_bytes: []
        },
        eth1: mockNetworkInterface
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
});
