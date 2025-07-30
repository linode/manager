import { useAccountSettings } from '@linode/queries';
import { useQueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import * as React from 'react';

import { useGlobalErrors } from 'src/hooks/useGlobalErrors';

import { useIsACLPEnabled } from './features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from './features/Databases/utilities';
import { ErrorBoundaryFallback } from './features/ErrorBoundary/ErrorBoundaryFallback';
import { useIsPlacementGroupsEnabled } from './features/PlacementGroups/utils';
import { router } from './routes';

export const Router = () => {
  const queryClient = useQueryClient();
  const globalErrors = useGlobalErrors();
  
  // These hooks may trigger API calls, but they'll be blocked by the request interceptor
  const { data: accountSettings } = useAccountSettings();
  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isACLPEnabled } = useIsACLPEnabled();

  // Update the router's context
  router.update({
    context: {
      accountSettings,
      globalErrors,
      isACLPEnabled,
      isDatabasesEnabled,
      isPlacementGroupsEnabled,
      queryClient,
    },
  });

  return (
    <ErrorBoundaryFallback>
      <RouterProvider router={router} />
    </ErrorBoundaryFallback>
  );
};
