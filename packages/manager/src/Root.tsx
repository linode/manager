import Grid from '@mui/material/Unstable_Grid2';
import { Outlet } from '@tanstack/react-router';
import React from 'react';

import Logo from 'src/assets/logo/akamai-logo.svg';
import { Box } from 'src/components/Box';
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
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import { ENABLE_MAINTENANCE_MODE } from './constants';
import { complianceUpdateContext } from './context/complianceUpdateContext';
import { sessionExpirationContext } from './context/sessionExpirationContext';
import { switchAccountSessionContext } from './context/switchAccountSessionContext';
import { useGlobalErrors } from './hooks/useGlobalErrors';
import { useStyles } from './MainContent.styles';
import { useProfile } from './queries/profile/profile';

export const Root = () => {
  const { classes, cx } = useStyles();
  const { data: preferences } = usePreferences();
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

  const desktopMenuIsOpen = preferences?.desktop_sidebar_open ?? false;

  const desktopMenuToggle = () => {
    updatePreferences({
      desktop_sidebar_open: !preferences?.desktop_sidebar_open,
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
    <div className={classes.appFrame}>
      <SessionExpirationProvider value={sessionExpirationContextValue}>
        <SwitchAccountSessionProvider value={switchAccountSessionContextValue}>
          <ComplianceUpdateProvider value={complianceUpdateContextValue}>
            <NotificationProvider value={contextValue}>
              <SideMenu
                closeMenu={() => toggleMenu(false)}
                collapse={desktopMenuIsOpen || false}
                open={menuIsOpen}
              />
              <div
                className={cx(classes.content, {
                  [classes.fullWidthContent]: desktopMenuIsOpen,
                })}
              >
                <MainContentBanner />
                <TopMenu
                  desktopMenuToggle={desktopMenuToggle}
                  isSideMenuOpen={!desktopMenuIsOpen}
                  openSideMenu={() => toggleMenu(true)}
                  username={username}
                />
                <main
                  className={classes.cmrWrapper}
                  id="main-content"
                  role="main"
                >
                  <Grid className={classes.grid} container spacing={0}>
                    <Grid className={cx(classes.switchWrapper, 'p0')}>
                      <GlobalNotifications />
                      <React.Suspense fallback={<SuspenseLoader />}>
                        <Outlet />
                      </React.Suspense>
                    </Grid>
                  </Grid>
                </main>
              </div>
            </NotificationProvider>
            <Footer desktopMenuIsOpen={desktopMenuIsOpen} />
          </ComplianceUpdateProvider>
        </SwitchAccountSessionProvider>
      </SessionExpirationProvider>
    </div>
  );
};
