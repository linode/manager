import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';

export const DataStreamRoute = () => {
  const flags = useFlags();
  const { aclpLogs } = flags;
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      {aclpLogs?.enabled ? <Outlet /> : <NotFound />}
    </React.Suspense>
  );
};
