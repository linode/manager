import { Navigate, useLocation } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { useFlags } from 'src/hooks/useFlags';

import AccountLogins from '../Account/AccountLogins';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const LoginHistoryLanding = () => {
  const flags = useFlags();
  const location = useLocation();

  if (
    !flags?.iamRbacPrimaryNavChanges &&
    location.pathname !== '/account/login-history'
  ) {
    return <Navigate replace to="/account/login-history" />;
  }

  const landingHeaderProps: LandingHeaderProps = {
    title: 'Login History',
  };

  return (
    <>
      <PlatformMaintenanceBanner pathname={location.pathname} />
      <MaintenanceBannerV2 pathname={location.pathname} />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <AccountLogins />
    </>
  );
};
