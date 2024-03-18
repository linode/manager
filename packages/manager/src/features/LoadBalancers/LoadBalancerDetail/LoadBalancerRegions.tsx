import React from 'react';

import { Stack, StackProps } from 'src/components/Stack';

import { RegionItem } from '../LoadBalancerLanding/RegionItem';

interface Props extends StackProps {
  /**
   * Disables the country flag that shows before the region label
   * @default false
   */
  hideFlags?: boolean;
  /**
   * The region ids
   */
  regionIds: string[];
}

export const LoadBalancerRegionsList = (props: Props) => {
  const { hideFlags, regionIds, ...rest } = props;

  return (
    <Stack spacing={1.25} {...rest}>
      {regionIds?.map((regionId) => (
        <RegionItem hideFlag={hideFlags} key={regionId} regionId={regionId} />
      ))}
    </Stack>
  );
};
