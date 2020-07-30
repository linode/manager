import * as React from 'react';
import NotificationSection from './NotificationSection';

export const Alerts: React.FC<{}> = _ => {
  return <NotificationSection content={[]} header="Alerts" />;
};

export default React.memo(Alerts);
