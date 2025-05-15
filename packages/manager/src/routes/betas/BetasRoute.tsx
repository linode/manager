import { NotFound } from '@linode/ui';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';

export const BetasRoute = () => {
  const flags = useFlags();
  const { selfServeBetas } = flags;
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      {selfServeBetas ? <Outlet /> : <NotFound />}
    </React.Suspense>
  );
};
