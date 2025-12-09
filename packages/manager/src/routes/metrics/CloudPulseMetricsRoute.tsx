import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsACLPEnabled } from 'src/features/CloudPulse/Utils/utils';

export const CloudPulseMetricsRoute = () => {
  const { isACLPEnabled } = useIsACLPEnabled();

  if (!isACLPEnabled) {
    return <NotFound />;
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Metrics" />
      <Outlet />
    </React.Suspense>
  );
};
