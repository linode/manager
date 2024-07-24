import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { ImageRegion } from '@linode/api-v4';

interface Props {
  onManageRegions: () => void;
  regions: ImageRegion[];
}

export const RegionsList = ({ onManageRegions, regions }: Props) => {
  const { isGeckoGAEnabled } = useIsGeckoEnabled();
  const { data: regionsData } = useRegionsQuery({
    transformRegionLabel: isGeckoGAEnabled,
  });

  return (
    <Typography>
      {regionsData?.find((region) => region.id == regions[0].region)?.label ??
        regions[0].region}
      {regions.length > 1 && (
        <>
          ,{' '}
          <StyledLinkButton onClick={onManageRegions}>
            +{regions.length - 1}
          </StyledLinkButton>
        </>
      )}
    </Typography>
  );
};
