import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsServerlessInferenceEnabled } from 'src/features/ServerlessInference/utils';

export const ServerlessInferenceRoute = () => {
  const { isServerlessInferenceEnabled } = useIsServerlessInferenceEnabled();

  if (!isServerlessInferenceEnabled) {
    return <NotFound />;
  }
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Serverless Inference" />
      <Outlet />
    </React.Suspense>
  );
};
