import * as React from 'react';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import useFlags from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { APIMaintenanceBanner } from './APIMaintenanceBanner';
import { EmailBounceNotificationSection } from './EmailBounce';
import RegionStatusBanner from './RegionStatusBanner';
import { isEmpty } from 'ramda';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';

const GlobalNotifications: React.FC<{}> = () => {
  const flags = useFlags();
  const suppliedMaintenances = flags.apiMaintenance?.maintenances; // The data (ID, and sometimes the title and body) we supply regarding maintenance events in LD.

  const { hasDismissedNotifications } = useDismissibleNotifications();

  const hasDismissedMaintenances = React.useMemo(
    () => hasDismissedNotifications(suppliedMaintenances ?? []),
    [hasDismissedNotifications, suppliedMaintenances]
  );

  const regions = useRegionsQuery().data ?? [];

  return (
    <>
      <EmailBounceNotificationSection />
      <RegionStatusBanner regions={regions} />
      <AbuseTicketBanner />
      {!isEmpty(suppliedMaintenances) && !hasDismissedMaintenances ? (
        <APIMaintenanceBanner suppliedMaintenances={suppliedMaintenances} />
      ) : null}
    </>
  );
};

export default GlobalNotifications;
