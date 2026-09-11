import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { InferencePlatformProvider } from 'src/features/InferencePlatform/InferencePlatformProvider';
import { useIsInferencePlatformEnabled } from 'src/features/InferencePlatform/utils';
import 'src/features/InferencePlatform/inferenceThemes.css';

export const InferencePlatformRoute = () => {
  const { isInferencePlatformEnabled } = useIsInferencePlatformEnabled();

  if (!isInferencePlatformEnabled) {
    return <NotFound />;
  }
  return (
    <InferencePlatformProvider>
      <React.Suspense fallback={<SuspenseLoader />}>
        <DocumentTitleSegment segment="Inference Platform" />
        <div className="inference-platform">
          <Outlet />
        </div>
      </React.Suspense>
    </InferencePlatformProvider>
  );
};
