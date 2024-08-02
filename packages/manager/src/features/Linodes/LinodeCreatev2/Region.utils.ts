import type { LinodeCreateType } from '../LinodesCreate/types';
import type { Image, Region } from '@linode/api-v4';
import type { DisableRegionOption } from 'src/components/RegionSelect/RegionSelect.types';

interface DisabledRegionOptions {
  linodeCreateTab: LinodeCreateType | undefined;
  regions: Region[];
  selectedImage: Image | undefined;
}

/**
 * Returns regions that should be disabled on the Linode Create flow.
 *
 * @returns key/value pairs for disabled regions. the key is the region id and the value is why the region is disabled
 */
export const getDisabledRegions = (options: DisabledRegionOptions) => {
  const { linodeCreateTab, regions, selectedImage } = options;

  // On the images tab, we disabled distributed regions if:
  // - The user has selected an Image
  // - The selected image does not have the `distributed-sites` capability
  if (
    linodeCreateTab === 'Images' &&
    selectedImage &&
    !selectedImage.capabilities.includes('distributed-sites')
  ) {
    const disabledRegions: Record<string, DisableRegionOption> = {};

    for (const region of regions) {
      if (region.site_type === 'distributed') {
        disabledRegions[region.id] = {
          reason:
            'The selected image cannot be deployed to a distributed region.',
        };
      }
    }

    return disabledRegions;
  }

  return {};
};
