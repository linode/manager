import * as React from 'react';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import { useRegionsQuery } from 'src/queries/regions';
import RegionStatusBanner from './RegionStatusBanner';
import { EmailBounceNotificationSection } from './EmailBounce';
import ComplianceBanner from './ComplianceBanner';

const GlobalNotifications: React.FC<{}> = () => {
  const regions = useRegionsQuery().data ?? [];

  return (
    <>
      <EmailBounceNotificationSection />
      <RegionStatusBanner regions={regions} />
      <AbuseTicketBanner />
      <ComplianceBanner />
    </>
  );
};

export default GlobalNotifications;
