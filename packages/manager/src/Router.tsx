import { useAccountSettings } from '@linode/queries';
import { useQueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { useIsACLPEnabled } from './features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from './features/Databases/utilities';
import { ErrorBoundaryFallback } from './features/ErrorBoundary/ErrorBoundaryFallback';
import { useIsPlacementGroupsEnabled } from './features/PlacementGroups/utils';
import { store } from './new-store';
import { router } from './routes';

export const Router = () => {
  const queryClient = useQueryClient();

  const { data: accountSettings } = useAccountSettings();
  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isACLPEnabled } = useIsACLPEnabled();
  const flags = useFlags();

  const isAccountUnactivated = useStore(
    store,
    (state) => state.isAccountUnactivated
  );

  // Update the router's context
  router.update({
    context: {
      accountSettings,
      flags,
      isAccountUnactivated,
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
