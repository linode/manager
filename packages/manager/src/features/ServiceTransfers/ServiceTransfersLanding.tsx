import { Navigate, useLocation } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { useFlags } from 'src/hooks/useFlags';

import { EntityTransfersLanding } from '../EntityTransfers/EntityTransfersLanding/EntityTransfersLanding';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const ServiceTransfersLanding = () => {
  const flags = useFlags();
  const location = useLocation();

  if (
    !flags?.iamRbacPrimaryNavChanges &&
    location.pathname !== '/account/service-transfers'
  ) {
    return <Navigate replace to="/account/service-transfers" />;
  }

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
