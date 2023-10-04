import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import type { Capabilities, Region, RegionStatus } from '@linode/api-v4';

// DATA
const tokyoDisabledMessage = (
  <Typography>
    Tokyo is sold out while we expand our capacity. We recommend deploying
    workloads in Osaka.{` `}
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
  disabledMessage: JSX.Element;
  fakeRegion: FakeRegion;
  featureFlag: string;
  regionId: 'ap-northeast';
}

export const listOfDisabledRegions: DisabledRegion[] = [
  {
    disabledMessage: tokyoDisabledMessage,
    fakeRegion: fakeTokyo,
    featureFlag: 'soldOutTokyo',
    regionId: 'ap-northeast',
  },
];
