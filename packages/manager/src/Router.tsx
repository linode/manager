import { useAccountSettings } from '@linode/queries';
import { QueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import * as React from 'react';

import { useGlobalErrors } from 'src/hooks/useGlobalErrors';

import { useIsACLPEnabled } from './features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from './features/Databases/utilities';
import { useIsPlacementGroupsEnabled } from './features/PlacementGroups/utils';
import { router } from './routes';

export const Router = () => {
  const { data: accountSettings } = useAccountSettings();
  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isACLPEnabled } = useIsACLPEnabled();
  const globalErrors = useGlobalErrors();

  // Update the router's context
  router.update({
    context: {
      accountSettings,
      globalErrors,
      isACLPEnabled,
      isDatabasesEnabled,
      isPlacementGroupsEnabled,
      queryClient: new QueryClient(),
    },
  });

  return <RouterProvider router={router} />;
};
