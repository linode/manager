import * as React from 'react';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import RegionStatusBanner from './RegionStatusBanner';
import { EmailBounceNotificationSection } from './EmailBounce';

const GlobalNotifications: React.FC<{}> = () => {
  return (
    <>
      <EmailBounceNotificationSection />
      <RegionStatusBanner />
      <AbuseTicketBanner />
    </>
  );
};

export default GlobalNotifications;
