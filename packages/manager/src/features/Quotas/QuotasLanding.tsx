import { Navigate, useLocation } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { useFlags } from 'src/hooks/useFlags';

import { Quotas } from '../Account/Quotas/Quotas';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const QuotasLanding = () => {
  const flags = useFlags();
  const location = useLocation();

  const isIAMRbacPrimaryNavChangesEnabled = flags?.iamRbacPrimaryNavChanges;

  if (
    !isIAMRbacPrimaryNavChangesEnabled &&
    location.pathname !== '/account/quotas'
  ) {
    return <Navigate replace to="/account/quotas" />;
  }

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/quotas',
    },

    title: 'Quotas',
  };

  return (
    <>
      <PlatformMaintenanceBanner pathname={location.pathname} />
      <MaintenanceBannerV2 pathname={location.pathname} />
      <DocumentTitleSegment segment="Quotas" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <Quotas />
    </>
  );
};
