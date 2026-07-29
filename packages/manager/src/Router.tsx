import { useAccountSettings, useProfile } from '@linode/queries';
import { useQueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useGlobalErrors } from 'src/hooks/useGlobalErrors';

import { useIsACLPEnabled } from './features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from './features/Databases/utilities';
import { ErrorBoundaryFallback } from './features/ErrorBoundary/ErrorBoundaryFallback';
import { useIsIAMEnabled } from './features/IAM/hooks/useIsIAMEnabled';
import { useIsPrivateImageSharingEnabled } from './features/Images/utils';
import { useIsPlacementGroupsEnabled } from './features/PlacementGroups/utils';
import { markAppShellReady } from './hooks/appShellReady';
import { useAppShellBootstrap } from './hooks/useAppShellBootstrap';
import { router } from './routes';

export const Router = () => {
  const queryClient = useQueryClient();
  const globalErrors = useGlobalErrors();

  const isAuthCallback =
    window.location.pathname === '/oauth/callback' ||
    window.location.pathname === '/admin/callback';

  const { isAppShellLoading } = useAppShellBootstrap(!isAuthCallback);
  const { data: profile } = useProfile();
  const { data: accountSettings } = useAccountSettings();
  const isDatabasesEnabled = useIsDatabasesEnabled();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();
  const { isACLPEnabled } = useIsACLPEnabled();
  const { isPrivateImageSharingEnabled } = useIsPrivateImageSharingEnabled();
  const { isIAMEnabled } = useIsIAMEnabled();
  const flags = useFlags();

  // Context is complete before root beforeLoad proceeds (see waitForAppShell).
  router.update({
    context: {
      accountSettings,
      flags,
      globalErrors,
      isACLPEnabled,
      isIAMEnabled,
      isPrivateImageSharingEnabled,
      isDatabasesEnabled,
      isPlacementGroupsEnabled,
      profile,
      queryClient,
    },
  });

  React.useLayoutEffect(() => {
    if (!isAppShellLoading) {
      markAppShellReady();
    }
  }, [isAppShellLoading]);

  return (
    <ErrorBoundaryFallback>
      <RouterProvider router={router} />
    </ErrorBoundaryFallback>
  );
};
