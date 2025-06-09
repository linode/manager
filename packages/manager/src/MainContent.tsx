import {
  useAccountSettings,
  useMutatePreferences,
  usePreferences,
  useProfile,
} from '@linode/queries';
import { Box } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useQueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { MainContentBanner } from 'src/components/MainContentBanner';
import { MaintenanceScreen } from 'src/components/MaintenanceScreen';
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from 'src/components/PrimaryNav/constants';
import { SideMenu } from 'src/components/PrimaryNav/SideMenu';
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
import { useIsIAMEnabled } from './features/IAM/hooks/useIsIAMEnabled';
import { TOPMENU_HEIGHT } from './features/TopMenu/constants';
import { useGlobalErrors } from './hooks/useGlobalErrors';
import { migrationRouter } from './routes';

import type { Theme } from '@mui/material/styles';
import type { AnyRouter } from '@tanstack/react-router';

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

const Account = React.lazy(() =>
  import('src/features/Account').then((module) => ({
    default: module.Account,
  }))
);
const NewDetailTemplateA = React.lazy(() =>
  import('src/features/NewDetailTemplate/NewDetailTemplateA').then(
    (module) => ({
      default: module.NewDetailTemplateA,
    })
  )
);
const LinodesRoutes = React.lazy(() =>
  import('src/features/Linodes').then((module) => ({
    default: module.LinodesRoutes,
  }))
);
const Profile = React.lazy(() =>
  import('src/features/Profile/Profile').then((module) => ({
    default: module.Profile,
  }))
);

const IAM = React.lazy(() =>
  import('src/features/IAM').then((module) => ({
    default: module.IdentityAccessManagement,
  }))
);

export const MainContent = () => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { classes, cx } = useStyles();
  const { data: isDesktopSidebarOpenPreference } = usePreferences(
    (preferences) => preferences?.desktop_sidebar_open
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();
  const queryClient = useQueryClient();

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

  const { data: accountSettings } = useAccountSettings();
  const defaultRoot = accountSettings?.managed ? '/managed' : '/linodes';

  const { isIAMEnabled } = useIsIAMEnabled();

  const isNarrowViewport = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(960)
  );

  const { isPageScrollable } = useIsPageScrollable(contentRef);

  migrationRouter.update({
    context: {
      globalErrors,
      queryClient,
    },
  });

  /**
   * this is the case where the user has successfully completed signup
   * but needs a manual review from Customer Support. In this case,
   * the user is going to get 403 errors from almost every single endpoint.
   *
   * So in this case, we'll show something more user-friendly
   */
  if (globalErrors.account_unactivated) {
    return (
      <>
        <Redirect to="/account-activation" />
        <RouterProvider
          context={{ queryClient }}
          router={migrationRouter as AnyRouter}
        />
      </>
    );
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
      <SessionExpirationProvider value={sessionExpirationContextValue}>
        <SwitchAccountSessionProvider value={switchAccountSessionContextValue}>
          <ComplianceUpdateProvider value={complianceUpdateContextValue}>
            <NotificationProvider value={contextValue}>
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
                              <Switch>
                                <Route
                                  component={LinodesRoutes}
                                  path="/linodes"
                                />
                                {isIAMEnabled && (
                                  <Route component={IAM} path="/iam" />
                                )}
                                <Route component={Account} path="/account" />
                                <Route component={Profile} path="/profile" />
                                <Route
                                  component={NewDetailTemplateA}
                                  path="/new-detail-template-a"
                                />
                                <Redirect exact from="/" to={defaultRoot} />
                                {/** We don't want to break any bookmarks. This can probably be removed eventually. */}
                                <Redirect from="/dashboard" to={defaultRoot} />
                                {/**
                                 * This is the catch all routes that allows TanStack Router to take over.
                                 * When a route is not found here, it will be handled by the migration router, which in turns handles the NotFound component.
                                 * It is currently set to the migration router in order to incrementally migrate the app to the new routing.
                                 * This is a temporary solution until we are ready to fully migrate to TanStack Router.
                                 */}
                                <Route path="*">
                                  <RouterProvider
                                    context={{ queryClient }}
                                    router={migrationRouter as AnyRouter}
                                  />
                                </Route>
                              </Switch>
                            </ErrorBoundaryFallback>
                          </React.Suspense>
                        </div>
                      </Grid>
                    </Grid>
                  </Box>
                  <Footer />
                </div>
              </Box>
            </NotificationProvider>
          </ComplianceUpdateProvider>
        </SwitchAccountSessionProvider>
      </SessionExpirationProvider>
    </div>
  );
};
