import { combineGraphData } from './TransferHistory';
import { Stats } from '@linode/api-v4/lib/linodes';

describe('combineGraphData', () => {
  const netStats: Stats['data']['netv4'] = {
    private_in: [],
    private_out: [],
    in: [],
    out: [
      [1, 100],
      [1, 200],
      [1, 300]
    ]
  };

  const stats: Stats = {
    title: 'Mock Stats',
    data: {
      cpu: [],
      netv4: netStats,
      netv6: netStats,
      io: { io: [], swap: [] }
    }
  };

  it('sums  public outbound v4 and v6 data', () => {
    expect(combineGraphData(stats)).toEqual([
      [1, 200],
      [1, 400],
      [1, 600]
    ]);
  });
});
