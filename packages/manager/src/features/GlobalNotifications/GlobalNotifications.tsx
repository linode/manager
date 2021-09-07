import * as React from 'react';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import useFlags from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { APIMaintenanceBanner } from './APIMaintenanceBanner';
import { EmailBounceNotificationSection } from './EmailBounce';
import RegionStatusBanner from './RegionStatusBanner';

const GlobalNotifications: React.FC<{}> = () => {
  const flags = useFlags();
  const apiMaintenanceIds = flags.apiMaintenance ?? [];

  const regions = useRegionsQuery().data ?? [];

  return (
    <>
      <EmailBounceNotificationSection />
      <RegionStatusBanner regions={regions} />
      <AbuseTicketBanner />
      {apiMaintenanceIds.length > 0 ? (
        <APIMaintenanceBanner apiMaintenanceIds={apiMaintenanceIds} />
      ) : null}
    </>
  );
};

export default GlobalNotifications;
