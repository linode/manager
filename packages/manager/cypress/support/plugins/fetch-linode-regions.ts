import { getRegions } from '@linode/api-v4';

import type { CypressPlugin } from './plugin';
import type { ResourcePage, Region } from '@linode/api-v4';

// TODO Clean up.
/**
 * Returns Region label formatted for Cloud Manager UI.
 *
 * This is a re-implementation of a similar util in the Cloud Manager code base.
 * Because it is needed by our Cypress config, which does not go through Vite, we
 * have to re-implement this util rather than import it because Cloud Manager
 * source code cannot be imported without Vite.
 *
 * @see {@link src/components/RegionSelect/RegionSelect.utils}
 */
export const getCloudManagerLabel = (region: Region) => {
  const [city] = region.label.split(', ');
  // Include state for the US
  if (region.country === 'us') {
    return `${region.country.toUpperCase()}, ${region.label}`;
  }
  return `${region.country.toUpperCase()}, ${city}`;
};

/**
 * Fetches Linode regions and stores data in Cypress `cloudManagerRegions` env.
 *
 * Throws an error if no OAuth token (used for regions API request) is defined.
 */
export const fetchLinodeRegions: CypressPlugin = async (on, config) => {
  const regions: ResourcePage<Region> = await getRegions({ page_size: 500 });

  const extendedRegions = regions.data.map((apiRegion: Region) => {
    return {
      ...apiRegion,
      label: getCloudManagerLabel(apiRegion),
      apiLabel: apiRegion.label,
    };
  });

  return {
    ...config,
    env: {
      ...config.env,
      cloudManagerRegions: extendedRegions,
    },
  };
};
