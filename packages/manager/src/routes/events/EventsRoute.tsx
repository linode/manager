import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

export const EventsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Outlet />
    </React.Suspense>
  );
};
