import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useIsACLPLogsEnabled } from 'src/features/Delivery/deliveryUtils';

export const DeliveryRoute = () => {
  const { isACLPLogsEnabled } = useIsACLPLogsEnabled();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      {isACLPLogsEnabled ? <Outlet /> : <NotFound />}
    </React.Suspense>
  );
};
