import * as React from 'react';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import { useRegionsQuery } from 'src/queries/regions';
import RegionStatusBanner from './RegionStatusBanner';
import { EmailBounceNotificationSection } from './EmailBounce';
import ComplianceBanner from './ComplianceBanner';
import ComplianceUpdateModal from './ComplianceUpdateModal';
import { complianceUpdateContext } from 'src/context/complianceUpdateContext';

const GlobalNotifications: React.FC<{}> = () => {
  const regions = useRegionsQuery().data ?? [];
  const complianceModelContext = React.useContext(complianceUpdateContext);

  return (
    <>
      <EmailBounceNotificationSection />
      <RegionStatusBanner regions={regions} />
      <AbuseTicketBanner />
      <ComplianceBanner />
      <ComplianceUpdateModal
        open={complianceModelContext.isOpen}
        onClose={complianceModelContext.close}
      />
    </>
  );
};

export default GlobalNotifications;
