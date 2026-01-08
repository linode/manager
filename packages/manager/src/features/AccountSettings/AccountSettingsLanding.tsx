import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { PlatformMaintenanceBanner } from 'src/components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';

import GlobalSettings from '../Account/GlobalSettings';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const AccountSettingsLanding = () => {
  const landingHeaderProps: LandingHeaderProps = {
    title: 'Account Settings',
  };

  return (
    <>
      <PlatformMaintenanceBanner />
      <MaintenanceBannerV2 />
      <DocumentTitleSegment segment="Account Settings" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <GlobalSettings />
    </>
  );
};
