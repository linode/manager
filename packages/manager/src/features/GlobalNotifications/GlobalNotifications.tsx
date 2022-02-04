import { isEmpty } from 'ramda';
import * as React from 'react';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import useFlags from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { APIMaintenanceBanner } from './APIMaintenanceBanner';
import ComplianceBanner from './ComplianceBanner';
import ComplianceUpdateModal from './ComplianceUpdateModal';
import { EmailBounceNotificationSection } from './EmailBounce';
import RegionStatusBanner from './RegionStatusBanner';
import TaxCollectionBanner from './TaxCollectionBanner';

const GlobalNotifications: React.FC<{}> = () => {
  const flags = useFlags();
  const suppliedMaintenances = flags.apiMaintenance?.maintenances; // The data (ID, and sometimes the title and body) we supply regarding maintenance events in LD.

  const { hasDismissedNotifications } = useDismissibleNotifications();

  const _hasDismissedNotifications = React.useCallback(
    hasDismissedNotifications,
    []
  );

  const hasDismissedMaintenances = React.useMemo(
    () => _hasDismissedNotifications(suppliedMaintenances ?? []),
    [_hasDismissedNotifications, suppliedMaintenances]
  );

  const regions = useRegionsQuery().data ?? [];

  return (
    <>
      <EmailBounceNotificationSection />
      <RegionStatusBanner regions={regions} />
      <AbuseTicketBanner />
      <ComplianceBanner />
      <ComplianceUpdateModal />
      {!isEmpty(suppliedMaintenances) && !hasDismissedMaintenances ? (
        <APIMaintenanceBanner suppliedMaintenances={suppliedMaintenances} />
      ) : null}
      {flags.taxCollectionBanner &&
      Object.keys(flags.taxCollectionBanner).length > 0 ? (
        <TaxCollectionBanner />
      ) : null}
    </>
  );
};

export default GlobalNotifications;
