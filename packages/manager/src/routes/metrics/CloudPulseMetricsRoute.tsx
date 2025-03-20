import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

export const CloudPulseMetricsRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Metrics" />
      <Outlet />
    </React.Suspense>
  );
};
