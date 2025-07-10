import { useAccountSettings } from '@linode/queries';
import { useQueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import React from 'react';

import { useGlobalErrors } from 'src/hooks/useGlobalErrors';

import { useIsACLPEnabled } from './features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from './features/Databases/utilities';
import { ErrorBoundaryFallback } from './features/ErrorBoundary/ErrorBoundaryFallback';
import { useIsPlacementGroupsEnabled } from './features/PlacementGroups/utils';
import { router } from './routes';

export const Router = () => {
  const queryClient = useQueryClient();
  const { data: accountSettings } = useAccountSettings();
  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isACLPEnabled } = useIsACLPEnabled();
  const globalErrors = useGlobalErrors();

  return (
    <ErrorBoundaryFallback useTanStackRouterBoundary={true}>
      <RouterProvider
        context={{
          globalErrors,
          accountSettings,
          isACLPEnabled,
          isDatabasesEnabled,
          isPlacementGroupsEnabled,
          queryClient,
        }}
        router={router}
      />
    </ErrorBoundaryFallback>
  );
};
