import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';

export const PlacementGroupsRoute = () => {
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Placement Groups" />
      {isPlacementGroupsEnabled ? <Outlet /> : <NotFound />}
    </React.Suspense>
  );
};
