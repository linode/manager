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
import Grid from '@mui/material/Grid';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import Logo from 'src/assets/logo/akamai-logo.svg';
import { MainContentBanner } from 'src/components/MainContentBanner';
import { MaintenanceScreen } from 'src/components/MaintenanceScreen';
import { SideMenu } from 'src/components/PrimaryNav/SideMenu';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useDialogContext } from 'src/context/useDialogContext';
import { Footer } from 'src/features/Footer';
import { GlobalNotifications } from 'src/features/GlobalNotifications/GlobalNotifications';
import {
  notificationCenterContext,
  useNotificationContext,
} from 'src/features/NotificationCenter/NotificationCenterContext';
import { TopMenu } from 'src/features/TopMenu/TopMenu';

import { ENABLE_MAINTENANCE_MODE } from './constants';
import { complianceUpdateContext } from './context/complianceUpdateContext';
import { sessionExpirationContext } from './context/sessionExpirationContext';
import { switchAccountSessionContext } from './context/switchAccountSessionContext';
import { useGlobalErrors } from './hooks/useGlobalErrors';
import { useStyles } from './Root.styles';

export const Root = () => {
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

  const desktopMenuIsOpen = isDesktopSidebarOpenPreference ?? false;

  const desktopMenuToggle = () => {
    updatePreferences({
      desktop_sidebar_open: !isDesktopSidebarOpenPreference,
    });
  };

  if (globalErrors.account_unactivated) {
    return (
      <div className={classes.bgStyling}>
        <div className={classes.activationWrapper}>
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <Logo className={classes.logo} width={215} />
          </Box>
          <Outlet />
        </div>
      </div>
    );
  }

  if (globalErrors.api_maintenance_mode || ENABLE_MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

  return (
    <div className={classes.appFrame} data-testid="root">
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
              <div className={classes.content}>
                <SideMenu
                  closeMenu={() => toggleMenu(false)}
                  collapse={desktopMenuIsOpen || false}
                  desktopMenuToggle={desktopMenuToggle}
                  open={menuIsOpen}
                />
                <Box
                  component="main"
                  id="main-content"
                  role="main"
                  sx={(theme) => ({
                    maxWidth: `${theme.breakpoints.values.lg}px !important`,
                    padding: `${theme.spacing(3)} 0`,
                    paddingTop: 12,
                    [theme.breakpoints.between('md', 'xl')]: {
                      paddingLeft: theme.spacing(2),
                      paddingRight: theme.spacing(2),
                    },
                    [theme.breakpoints.down('md')]: {
                      paddingLeft: 0,
                      paddingRight: 0,
                      paddingTop: theme.spacing(2),
                    },
                    transition: theme.transitions.create('opacity'),
                  })}
                >
                  <Grid className={classes.grid} container spacing={0}>
                    <Grid className={cx(classes.switchWrapper, 'p0')}>
                      <GlobalNotifications />
                      <React.Suspense fallback={<SuspenseLoader />}>
                        <Outlet />
                      </React.Suspense>
                    </Grid>
                  </Grid>
                </Box>
              </div>
            </NotificationProvider>
            <Footer />
          </ComplianceUpdateProvider>
        </SwitchAccountSessionProvider>
      </SessionExpirationProvider>
    </div>
  );
};
