import { Linode } from '@linode/api-v4';
import { NodeBalancer } from '@linode/api-v4';

import { linodeFactory } from 'src/factories';
import { nodeBalancerFactory } from 'src/factories';

import { mapIdsToDevices } from './mapIdsToDevices';

describe('mapIdsToDevices', () => {
  const linodes = linodeFactory.buildList(5);
  const nodebalancers = nodeBalancerFactory.buildList(5);
  it('works with a single Linode ID', () => {
    expect(mapIdsToDevices<Linode>(1, linodes)).toBe(linodes[1]);
  });
  it('works with a single NodeBalancer ID', () => {
    expect(mapIdsToDevices<NodeBalancer>(1, nodebalancers)).toBe(
      nodebalancers[1]
    );
  });
  it('works with a multiple Linode IDs', () => {
    expect(mapIdsToDevices<Linode>([0, 1, 2], linodes)).toEqual([
      linodes[0],
      linodes[1],
      linodes[2],
    ]);
  });
  it('works with a multiple NodeBalancer IDs', () => {
    expect(mapIdsToDevices<NodeBalancer>([0, 1, 2], nodebalancers)).toEqual([
      nodebalancers[0],
      nodebalancers[1],
      nodebalancers[2],
    ]);
  });
  it('omits missing IDs', () => {
    expect(mapIdsToDevices<Linode>(99, linodes)).toBe(null);
    expect(mapIdsToDevices<NodeBalancer>(99, nodebalancers)).toBe(null);
    expect(mapIdsToDevices<Linode>([0, 99, 2], linodes)).toEqual([
      linodes[0],
      linodes[2],
    ]);
    expect(mapIdsToDevices<NodeBalancer>([0, 99, 2], nodebalancers)).toEqual([
      nodebalancers[0],
      nodebalancers[2],
    ]);
  });
});
