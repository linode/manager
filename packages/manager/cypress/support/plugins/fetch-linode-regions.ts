import { getRegions } from '@linode/api-v4';
import { extendRegion } from 'support/util/regions';

import type { CypressPlugin } from './plugin';
import type { ResourcePage, Region } from '@linode/api-v4';
import type { ExtendedRegion } from 'support/util/regions';

/**
 * Fetches Linode regions and stores data in Cypress `cloudManagerRegions` env.
 *
 * Throws an error if no OAuth token (used for regions API request) is defined.
 */
export const fetchLinodeRegions: CypressPlugin = async (on, config) => {
  const regions: ResourcePage<Region> = await getRegions({ page_size: 500 });

  const extendedRegions: ExtendedRegion[] = regions.data.map(
    (apiRegion: Region): ExtendedRegion => extendRegion(apiRegion)
  );

  return {
    ...config,
    env: {
      ...config.env,
      cloudManagerRegions: extendedRegions,
    },
  };
};
