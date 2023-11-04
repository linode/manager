// ********** THIS FILE IS GOING AWAY WITH DC GET WELL ***********
// Not reorganizing utils and types for this file for this reason.
// ***************************************************************

import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { regionFactory } from 'src/factories';

import type { Region } from '@linode/api-v4';

// TOKYO
const TOKYO_DISABLED_MESSAGE =
  'Tokyo is sold out while we expand our capacity. We recommend deploying workloads in Osaka.';
const TOKYO_DISABLED_MESSAGE_LINK =
  'https://www.linode.com/blog/linode/tokyo-region-availability-update/';

// SINGAPORE
const SINGAPORE_DISABLED_MESSAGE =
  'Singapore is sold out while we expand our capacity. We recommend deploying workloads in Osaka.';
const SINGAPORE_DISABLED_MESSAGE_LINK =
  'https://www.linode.com/blog/linode/singapore-region-availability-update/';

// UTILS
interface DisabledMessage {
  disabledLink: string;
  disabledMessage: string;
}

const disabledMessage = ({
  disabledLink,
  disabledMessage,
}: DisabledMessage): JSX.Element => (
  <Typography>
    {disabledMessage}
    <br />
    <Link to={disabledLink}>Learn more</Link>.
  </Typography>
);

export interface FakeRegion extends Region {
  /**
   * The message to display when the region is disabled.
   */
  disabledMessage: JSX.Element;
}

export interface DisabledRegion {
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

/**
 * A list of regions that should be displayed as disabled (if not already included in the /regions response).
 * They are controlled by feature flags so they're safe to remain here.
 */
export const listOfDisabledRegions: DisabledRegion[] = [
  {
    excludePaths: ['/object-storage/buckets/create', '/vpcs/create'],
    fakeRegion: {
      disabledMessage: disabledMessage({
        disabledLink: TOKYO_DISABLED_MESSAGE_LINK,
        disabledMessage: TOKYO_DISABLED_MESSAGE,
      }),
      ...regionFactory.build({
        country: 'JP',
        id: 'ap-northeast',
        label: 'Tokyo, JP',
      }),
    },
    featureFlag: 'soldOutTokyo',
  },
  {
    excludePaths: ['/vpcs/create'],
    fakeRegion: {
      disabledMessage: disabledMessage({
        disabledLink: SINGAPORE_DISABLED_MESSAGE_LINK,
        disabledMessage: SINGAPORE_DISABLED_MESSAGE,
      }),
      ...regionFactory.build({
        country: 'SG',
        id: 'ap-south',
        label: 'Singapore, SG',
      }),
    },
    featureFlag: 'soldOutSingapore',
  },
];
