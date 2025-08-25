import { Navigate, useLocation } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { useFlags } from 'src/hooks/useFlags';

import { UsersLanding } from '../Users/UsersLanding';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const UsersAndGrants = () => {
  const flags = useFlags();
  const location = useLocation();

  const isIAMRbacPrimaryNavChangesEnabled = flags?.iamRbacPrimaryNavChanges;

  if (
    !isIAMRbacPrimaryNavChangesEnabled &&
    location.pathname !== '/account/users'
  ) {
    return <Navigate replace to="/account/users" />;
  }

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/users',
    },

    title: 'Users And Grants',
  };

  return (
    <>
      <PlatformMaintenanceBanner pathname={location.pathname} />
      <MaintenanceBannerV2 pathname={location.pathname} />
      <DocumentTitleSegment segment="Users And Grants" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <UsersLanding />
    </>
  );
};
