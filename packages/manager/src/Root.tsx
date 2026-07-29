import { Outlet, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { MaintenanceScreen } from 'src/components/MaintenanceScreen';
import { Snackbar } from 'src/components/Snackbar/Snackbar';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useDialogContext } from 'src/context/useDialogContext';
import { ErrorBoundaryFallback } from 'src/features/ErrorBoundary/ErrorBoundaryFallback';
import {
  notificationCenterContext,
  useNotificationContext,
} from 'src/features/NotificationCenter/NotificationCenterContext';

import { ENABLE_MAINTENANCE_MODE } from './constants';
import { complianceUpdateContext } from './context/complianceUpdateContext';
import { sessionExpirationContext } from './context/sessionExpirationContext';
import { switchAccountSessionContext } from './context/switchAccountSessionContext';
import { GoTo } from './GoTo';
import { useAdobeAnalytics } from './hooks/useAdobeAnalytics';
import { useGlobalErrors } from './hooks/useGlobalErrors';
import { useLiveChatBootstrap } from './hooks/useLiveChatBootstrap';
import { useNewRelic } from './hooks/useNewRelic';
import { usePendo } from './hooks/usePendo';
import { useSessionExpiryToast } from './hooks/useSessionExpiryToast';
import { useEventsPoller } from './queries/events/events';

export const SIDEBAR_WIDTH = 232;
export const SIDEBAR_COLLAPSED_WIDTH = 49; // 48px + 1px border
export const PRIMARY_NAV_TOGGLE_HEIGHT = 46;

export const Root = () => {
  const navigate = useNavigate();

  const globalErrors = useGlobalErrors();

  const NotificationProvider = notificationCenterContext.Provider;
  const contextValue = useNotificationContext();

  const ComplianceUpdateProvider = complianceUpdateContext.Provider;
  const complianceUpdateContextValue = useDialogContext();

  const SwitchAccountSessionProvider = switchAccountSessionContext.Provider;
  const switchAccountSessionContextValue = useDialogContext({
    isOpen: false,
  });

  const SessionExpirationProvider = sessionExpirationContext.Provider;
  const sessionExpirationContextValue = useDialogContext({
    isOpen: false,
  });

  /**
   * this is the case where the user has successfully completed signup
   * but needs a manual review from Customer Support. In this case,
   * the user is going to get 403 errors from almost every single endpoint.
   *
   * So in this case, we'll show something more user-friendly
   */
  if (globalErrors.account_unactivated) {
    navigate({ to: '/account-activation' });
  }

  // If the API is in maintenance mode, return a Maintenance screen
  if (globalErrors.api_maintenance_mode || ENABLE_MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

  return (
    <div>
      <Snackbar
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        autoHideDuration={4000}
        hideIconVariant={false}
        maxSnack={3}
      >
        <SessionExpirationProvider value={sessionExpirationContextValue}>
          <SwitchAccountSessionProvider
            value={switchAccountSessionContextValue}
          >
            <ComplianceUpdateProvider value={complianceUpdateContextValue}>
              <NotificationProvider value={contextValue}>
                <GoTo />
                <React.Suspense fallback={<SuspenseLoader />}>
                  <ErrorBoundaryFallback>
                    <Outlet />
                  </ErrorBoundaryFallback>
                </React.Suspense>
                <GlobalListeners />
              </NotificationProvider>
            </ComplianceUpdateProvider>
          </SwitchAccountSessionProvider>
        </SessionExpirationProvider>
      </Snackbar>
    </div>
  );
};

const GlobalListeners = () => {
  useEventsPoller();
  useAdobeAnalytics();
  useLiveChatBootstrap();
  usePendo();
  useNewRelic();
  useSessionExpiryToast();
  return null;
};
