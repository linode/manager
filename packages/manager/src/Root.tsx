// Supports weights 300-700
import '@fontsource/fira-code';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';
import '@fontsource/nunito-sans/800.css';
import '@fontsource/nunito-sans/400-italic.css';
import {
  useMutatePreferences,
  usePreferences,
  useProfile,
} from '@linode/queries';
import { Box } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Outlet, useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { MainContentBanner } from 'src/components/MainContentBanner';
import { MaintenanceScreen } from 'src/components/MaintenanceScreen';
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from 'src/components/PrimaryNav/constants';
import { SideMenu } from 'src/components/PrimaryNav/SideMenu';
import { Snackbar } from 'src/components/Snackbar/Snackbar';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useDialogContext } from 'src/context/useDialogContext';
import { ErrorBoundaryFallback } from 'src/features/ErrorBoundary/ErrorBoundaryFallback';
import { Footer } from 'src/features/Footer';
import { GlobalNotifications } from 'src/features/GlobalNotifications/GlobalNotifications';
import {
  notificationCenterContext,
  useNotificationContext,
} from 'src/features/NotificationCenter/NotificationCenterContext';
import { TopMenu } from 'src/features/TopMenu/TopMenu';

import { useIsPageScrollable } from './components/PrimaryNav/utils';
import { ENABLE_MAINTENANCE_MODE } from './constants';
import { complianceUpdateContext } from './context/complianceUpdateContext';
import { sessionExpirationContext } from './context/sessionExpirationContext';
import { switchAccountSessionContext } from './context/switchAccountSessionContext';
import { TOPMENU_HEIGHT } from './features/TopMenu/constants';
import { GoTo } from './GoTo';
import { useAdobeAnalytics } from './hooks/useAdobeAnalytics';
import { useGlobalErrors } from './hooks/useGlobalErrors';
import { useNewRelic } from './hooks/useNewRelic';
import { usePendo } from './hooks/usePendo';
import { useSessionExpiryToast } from './hooks/useSessionExpiryToast';
import { useEventsPoller } from './queries/events/events';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  activationWrapper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up('xl')]: {
      margin: '0 auto',
      width: '50%',
    },
  },
  appFrame: {
    backgroundColor: theme.bg.app,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },
  bgStyling: {
    backgroundColor: theme.bg.main,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    transition: 'margin-left .1s linear',
    width: '100%',
  },
  fullWidthContent: {
    marginLeft: 0,
  },
  grid: {
    marginLeft: 0,
    marginRight: 0,
    [theme.breakpoints.up('lg')]: {
      height: '100%',
    },
    width: '100%',
  },
  logo: {
    '& > g': {
      fill: theme.color.black,
    },
  },
  switchWrapper: {
    '& > .MuiGrid-container': {
      maxWidth: theme.breakpoints.values.lg,
      width: '100%',
    },
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%',
      },
    },
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
  },
}));

export const Root = () => {
  const navigate = useNavigate();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { classes, cx } = useStyles();

  const { data: isDesktopSidebarOpenPreference } = usePreferences(
    (preferences) => preferences?.desktop_sidebar_open
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();

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

  const [menuIsOpen, toggleMenu] = React.useState<boolean>(false);

  const { data: profile } = useProfile();
  const username = profile?.username || '';

  const isNarrowViewport = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(960)
  );

  const { isPageScrollable } = useIsPageScrollable(contentRef);

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

  const desktopMenuIsOpen = isDesktopSidebarOpenPreference ?? false;

  const desktopMenuToggle = () => {
    updatePreferences({
      desktop_sidebar_open: !isDesktopSidebarOpenPreference,
    });
  };

  return (
    <div className={classes.appFrame}>
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
                <MainContentBanner />
                <TopMenu
                  desktopMenuToggle={desktopMenuToggle}
                  openSideMenu={() => toggleMenu(true)}
                  username={username}
                />
                <Box display="flex" flex={1} position="relative" zIndex={1}>
                  <Box
                    height={
                      isNarrowViewport
                        ? '100%'
                        : isPageScrollable
                          ? '100vh'
                          : `calc(100vh - ${TOPMENU_HEIGHT}px)`
                    }
                    position="sticky"
                    top={0}
                    zIndex={1400}
                  >
                    <SideMenu
                      closeMenu={() => toggleMenu(false)}
                      collapse={desktopMenuIsOpen || false}
                      desktopMenuToggle={desktopMenuToggle}
                      open={menuIsOpen}
                    />
                  </Box>
                  <div
                    className={cx(classes.content, {
                      [classes.fullWidthContent]: desktopMenuIsOpen === true,
                    })}
                    style={{
                      marginLeft: isNarrowViewport
                        ? 0
                        : desktopMenuIsOpen ||
                            (desktopMenuIsOpen && desktopMenuIsOpen === true)
                          ? SIDEBAR_COLLAPSED_WIDTH
                          : SIDEBAR_WIDTH,
                    }}
                  >
                    <MainContentBanner />
                    <Box
                      component="main"
                      id="main-content"
                      role="main"
                      sx={(theme) => ({
                        flex: 1,
                        margin: '0 auto',
                        maxWidth: `${theme.breakpoints.values.lg}px !important`,
                        pb: theme.spacingFunction(32),
                        pt: theme.spacingFunction(24),
                        px: {
                          md: theme.spacingFunction(16),
                          xs: 0,
                        },
                        transition: theme.transitions.create('opacity'),
                        width: isNarrowViewport
                          ? '100%'
                          : `calc(100vw - ${
                              desktopMenuIsOpen
                                ? SIDEBAR_COLLAPSED_WIDTH
                                : SIDEBAR_WIDTH
                            }px)`,
                      })}
                    >
                      <Grid
                        className={classes.grid}
                        container
                        ref={contentRef}
                        spacing={0}
                      >
                        <Grid className={cx(classes.switchWrapper, 'p0')}>
                          <div className="content-wrapper">
                            <GlobalNotifications />
                            <React.Suspense fallback={<SuspenseLoader />}>
                              <ErrorBoundaryFallback>
                                <Outlet />
                              </ErrorBoundaryFallback>
                            </React.Suspense>
                          </div>
                        </Grid>
                      </Grid>
                    </Box>
                    <Footer />
                  </div>
                </Box>
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
  usePendo();
  useNewRelic();
  useSessionExpiryToast();
  return null;
};
