import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';

import { default as AccountMaintenanceLanding } from '../Account/Maintenance/MaintenanceLanding';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const MaintenanceLanding = () => {
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
