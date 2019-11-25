import { LongviewProcesses, Stat } from 'src/features/Longview/request.types';
import { getAverage, mungeData } from './ProcessesLanding';

const mockStats = (n1: number, n2: number, n3: number) => [
  { x: 1574702940, y: n1 },
  { x: 1574703000, y: n2 },
  { x: 1574703060, y: n3 }
];

const mockProcess = {
  cpu: mockStats(10, 20, 30),
  count: mockStats(0, 1, 2),
  ioreadkbytes: mockStats(1000, 2000, 3000),
  iowritekbytes: mockStats(1000, 2000, 3000),
  mem: mockStats(1000, 2000, 3000)
};
const mockData: LongviewProcesses = {
  Processes: {
    cron: {
      longname: '/usr/sbin/cron',
      root: mockProcess
      // TypeScript was giving me trouble here.
    } as any,
    'linode-longview': {
      longname: 'linode-longview',
      root: mockProcess
    } as any,
    bash: {
      longname: '-bash',
      root: mockProcess,
      user1: mockProcess
    } as any
  }
};

describe('mungeData utility function', () => {
  const munged = mungeData(mockData);

  it('includes the process name on each entry', () => {
    Object.keys(mockData.Processes).forEach(processName => {
      expect(munged.find(p => p.name === processName)).toBeDefined();
    });
  });

  it('includes the username on each entry', () => {
    // console.log(munged);
    Object.values(mockData.Processes).forEach(process => {
      const { longname, ...users } = process;
      Object.keys(users).forEach(user => {
        expect(munged.find(p => p.user === user)).toBeDefined();
      });
    });
  });

  it('returns average CPU', () => {
    expect(munged[0].averageCPU).toBe(20);
  });
  it('returns average IO', () => {
    expect(munged[0].averageCPU).toBe(20);
  });
});

describe('get average  utility ', () => {
  it('returns the average', () => {
    const data: Stat[] = [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }];
    expect(getAverage(data)).toBe(2);
  });
});
