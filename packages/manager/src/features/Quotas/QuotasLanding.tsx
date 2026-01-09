import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';

import { Quotas } from '../Account/Quotas/Quotas';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const QuotasLanding = () => {
  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/quotas',
    },

    title: 'Quotas',
  };

  return (
    <>
      <PlatformMaintenanceBanner />
      <MaintenanceBannerV2 />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <Quotas />
    </>
  );
};
