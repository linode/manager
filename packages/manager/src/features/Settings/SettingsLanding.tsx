import { Navigate, useLocation } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { useFlags } from 'src/hooks/useFlags';

import GlobalSettings from '../Account/GlobalSettings';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const SettingsLanding = () => {
  const flags = useFlags();
  const location = useLocation();

  if (
    !flags?.iamRbacPrimaryNavChanges &&
    location.pathname !== '/account/settings'
  ) {
    return <Navigate replace to="/account/settings" />;
  }

  const landingHeaderProps: LandingHeaderProps = {
    title: 'Settings',
  };

  return (
    <>
      <PlatformMaintenanceBanner pathname={location.pathname} />
      <MaintenanceBannerV2 pathname={location.pathname} />
      <DocumentTitleSegment segment="Settings" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <GlobalSettings />
    </>
  );
};
