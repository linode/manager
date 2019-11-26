import { longviewProcessFactory } from 'src/factories/longviewProcess';
import { extendData } from './ProcessesLanding';

const mockData = longviewProcessFactory.build();

describe('extendData utility function', () => {
  const extendedData = extendData(mockData);

  it('includes the process name on each entry', () => {
    Object.keys(mockData.Processes!).forEach(processName => {
      expect(extendedData.find(p => p.name === processName)).toBeDefined();
    });
  });

  it('includes the username on each entry', () => {
    Object.values(mockData.Processes!).forEach(process => {
      const { longname, ...users } = process;
      Object.keys(users).forEach(user => {
        expect(extendedData.find(p => p.user === user)).toBeDefined();
      });
    });
  });

  it('includes the max count', () => {
    expect(extendedData[0].maxCount).toBe(3);
  });

  it('includes average CPU', () => {
    expect(extendedData[0].averageCPU).toBe(2);
  });

  it('includes average IO', () => {
    expect(extendedData[0].averageCPU).toBe(2);
  });

  it('includes the average memory', () => {
    expect(extendedData[0].averageMem).toBe(2);
  });

  it('survives malformed data', () => {
    expect(extendData({})).toEqual([]);
    expect(extendData({ Processes: {} })).toEqual([]);
    expect(extendData({ Processes: { bash: {} } as any })).toEqual([]);
    const extendedMalformedData = extendData({
      Processes: { bash: { root: {} } } as any
    });
    expect(extendedMalformedData[0].name).toEqual('bash');
    expect(extendedMalformedData[0].user).toEqual('root');
    expect(extendedMalformedData[0].maxCount).toBe(0);
    expect(extendedMalformedData[0].averageIO).toBe(0);
    expect(extendedMalformedData[0].averageCPU).toBe(0);
    expect(extendedMalformedData[0].averageMem).toBe(0);
  });
});
