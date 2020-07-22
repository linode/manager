import * as React from 'react';
import AlertIcon from 'src/assets/icons/flag.svg';
import NotificationSection from './NotificationSection';

export const Alerts: React.FC<{}> = _ => {
  return (
    <NotificationSection content={[]} header="Alerts" icon={<AlertIcon />} />
  );
};

export default React.memo(Alerts);
