import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import type { Capabilities, Region, RegionStatus } from '@linode/api-v4';

// DATA
const tokyoDisabledMessage = (
  <Typography>
    Tokyo is sold out while we expand our capacity. We recommend deploying
    workloads in Osaka.{` `}
    <br />
    <Link to="https://www.linode.com/blog/linode/tokyo-region-availability-update/">
      Learn more
    </Link>
    .
  </Typography>
);

const fakeTokyo: FakeRegion = {
  capabilities: ['Linodes', 'NodeBalancers'] as Capabilities[],
  country: 'jp',
  disabled: true,
  display: 'Tokyo, JP',
  id: 'ap-northeast',
  label: 'Tokyo, JP',
  resolvers: {
    ipv4:
      '173.230.129.5,173.230.136.5,173.230.140.5,66.228.59.5,66.228.62.5,50.116.35.5,50.116.41.5,23.239.18.5',
    ipv6: '',
  },
  status: 'ok' as RegionStatus,
};

type FakeRegion = Region & { disabled: boolean; display: string };

// UTILS
interface DisabledRegion {
  /**
   * The message to display when the region is disabled.
   */
  disabledMessage: JSX.Element;
  /**
   * A list of paths that should not display the fake region.
   */
  excludePaths?: string[];
  /**
   * The fake region to display.
   */
  fakeRegion: FakeRegion;
  /**
   * The feature flag that controls whether the fake region should be displayed.
   */
  featureFlag: string;
}

export const listOfDisabledRegions: DisabledRegion[] = [
  {
    disabledMessage: tokyoDisabledMessage,
    excludePaths: ['/object-storage/buckets/create', '/vpcs/create'],
    fakeRegion: fakeTokyo,
    featureFlag: 'soldOutTokyo',
  },
];
