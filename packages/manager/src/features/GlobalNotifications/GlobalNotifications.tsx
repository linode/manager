import * as React from 'react';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import useFlags from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { APIMaintenanceBanner } from './APIMaintenanceBanner';
import { EmailBounceNotificationSection } from './EmailBounce';
import RegionStatusBanner from './RegionStatusBanner';
import { isEmpty } from 'ramda';

const GlobalNotifications: React.FC<{}> = () => {
  const flags = useFlags();
  const suppliedMaintenances = flags.apiMaintenance?.maintenances; // The data (ID, and sometimes the title and body) we supply regarding maintenance events in LD.

  const regions = useRegionsQuery().data ?? [];

  return (
    <>
      <EmailBounceNotificationSection />
      <RegionStatusBanner regions={regions} />
      <AbuseTicketBanner />
      {!isEmpty(suppliedMaintenances) ? (
        <APIMaintenanceBanner suppliedMaintenances={suppliedMaintenances} />
      ) : null}
    </>
  );
};

export default GlobalNotifications;
