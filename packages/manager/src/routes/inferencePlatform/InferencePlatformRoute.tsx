import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsInferencePlatformEnabled } from 'src/features/InferencePlatform/utils';

export const InferencePlatformRoute = () => {
  const { isInferencePlatformEnabled } = useIsInferencePlatformEnabled();

  if (!isInferencePlatformEnabled) {
    return <NotFound />;
  }
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Inference Platform" />
      <Outlet />
    </React.Suspense>
  );
};
