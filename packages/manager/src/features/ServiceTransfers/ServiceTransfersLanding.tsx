import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';

import { EntityTransfersLanding } from '../EntityTransfers/EntityTransfersLanding/EntityTransfersLanding';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const ServiceTransfersLanding = () => {
  const landingHeaderProps: LandingHeaderProps = {
    title: 'Service Transfers',
  };

  return (
    <>
      <PlatformMaintenanceBanner />
      <MaintenanceBannerV2 />
      <DocumentTitleSegment segment="Service Transfers" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <EntityTransfersLanding />
    </>
  );
};
