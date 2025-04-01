import { useRegionsQuery } from '@linode/queries';

import type { Region } from '@linode/api-v4';

export const useIsGeckoEnabled = (
  isGecko2EnabledFlag: boolean | undefined,
  isGecko2LAFlag: boolean | undefined
) => {
  const { data: regions } = useRegionsQuery();

  const isGeckoLA = isGecko2EnabledFlag && isGecko2LAFlag;
  const isGeckoBeta = isGecko2EnabledFlag && !isGecko2LAFlag;

  const hasDistributedRegionCapability = regions?.some((region: Region) =>
    region.capabilities.includes('Distributed Plans')
  );
  const isGeckoLAEnabled = Boolean(hasDistributedRegionCapability && isGeckoLA);
  const isGeckoBetaEnabled = Boolean(
    hasDistributedRegionCapability && isGeckoBeta
  );

  return { isGeckoBetaEnabled, isGeckoLAEnabled };
};
