import { Navigate, useLocation } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { useFlags } from 'src/hooks/useFlags';

import { default as AccountMaintenanceLanding } from '../Account/Maintenance/MaintenanceLanding';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const MaintenanceLanding = () => {
  const flags = useFlags();
  const location = useLocation();

  if (
    !flags?.iamRbacPrimaryNavChanges &&
    location.pathname !== '/account/maintenance'
  ) {
    return <Navigate replace to="/account/maintenance" />;
  }

  const landingHeaderProps: LandingHeaderProps = {
    title: 'Maintenance',
  };

  return (
    <>
      <PlatformMaintenanceBanner />
      <MaintenanceBannerV2 />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <AccountMaintenanceLanding />
    </>
  );
};
