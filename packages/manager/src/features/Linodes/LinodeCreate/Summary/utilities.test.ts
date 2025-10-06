import { linodeTypeFactory } from '@linode/utilities';

import { getLinodePrice, getParsedMarketplaceClusterData } from './utilities';

describe('getLinodePrice', () => {
  it('gets a price for a normal Linode', () => {
    const type = linodeTypeFactory.build({
      price: { hourly: 0.1, monthly: 5 },
    });

    const result = getLinodePrice({
      clusterSize: undefined,
      regionId: 'fake-region-id',
      type,
    });

    expect(result).toBe('$5/month');
  });

  it('gets a price for a Marketplace Cluster deployment', () => {
    const type = linodeTypeFactory.build({
      price: { hourly: 0.2, monthly: 5 },
    });

    const result = getLinodePrice({
      clusterSize: '3',
      regionId: 'fake-region-id',
      type,
    });

    expect(result).toBe('3 Nodes - $15/month $0.60/hr');
  });
});

describe('getParsedMarketplaceClusterData', () => {
  it('parses stackscript user defined fields', () => {
    const stackscriptData = {
      cluster_size: '1',
      mysql_cluster_size: '5',
      mysql_cluster_type: 'Linode 2GB',
      redis_cluster_size: '5',
      redis_cluster_type: 'Linode 2GB',
    };

    expect(getParsedMarketplaceClusterData(stackscriptData)).toStrictEqual([
      {
        prefix: 'mysql',
        size: '5',
        typeLabel: 'Linode 2GB',
      },
      {
        prefix: 'redis',
        size: '5',
        typeLabel: 'Linode 2GB',
      },
    ]);
  });
});
