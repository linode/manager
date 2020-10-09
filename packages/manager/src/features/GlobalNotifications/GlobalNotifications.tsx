import * as React from 'react';
import RegionStatusBanner from './RegionStatusBanner';
import { EmailBounceNotificationSection } from './EmailBounce';

const GlobalNotifications: React.FC<{}> = () => {
  return (
    <>
      <EmailBounceNotificationSection />
      <RegionStatusBanner />
    </>
  );
};

export default GlobalNotifications;
