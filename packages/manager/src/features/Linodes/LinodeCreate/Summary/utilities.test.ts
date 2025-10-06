import { linodeTypeFactory } from '@linode/utilities';

import { getLinodePrice, getParsedMarketplaceClusterData } from './utilities';

describe('getLinodePrice', () => {
  it('gets a price for a normal Linode', () => {
    const type = linodeTypeFactory.build({
      price: { hourly: 0.1, monthly: 5 },
    });

    const result = getLinodePrice({
      stackscriptData: undefined,
      regionId: 'fake-region-id',
      type,
      types: [],
    });

    expect(result).toBe('$5/month');
  });

  it('gets a price for a Marketplace Cluster deployment', () => {
    const type = linodeTypeFactory.build({
      price: { hourly: 0.2, monthly: 5 },
    });

    const result = getLinodePrice({
      stackscriptData: {
        cluster_size: '3',
      },
      regionId: 'fake-region-id',
      types: [],
      type,
    });

    expect(result).toBe('3 Nodes - $15/month $0.60/hr');
  });
});

describe('getParsedMarketplaceClusterData', () => {
  it('parses stackscript user defined fields', () => {
    const types = [
      linodeTypeFactory.build({ label: 'Linode 2GB' }),
      linodeTypeFactory.build({ label: 'Linode 4GB' }),
    ];

    const stackscriptData = {
      cluster_size: '1',
      mysql_cluster_size: '5',
      mysql_cluster_type: 'Linode 2GB',
      redis_cluster_size: '5',
      redis_cluster_type: 'Linode 4GB',
    };

    expect(
      getParsedMarketplaceClusterData(stackscriptData, types)
    ).toStrictEqual([
      {
        prefix: 'mysql',
        size: '5',
        type: types[0],
      },
      {
        prefix: 'redis',
        size: '5',
        type: types[1],
      },
    ]);
  });
});
