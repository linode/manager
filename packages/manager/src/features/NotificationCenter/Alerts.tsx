import * as React from 'react';
import NotificationSection from './NotificationSection';

export const Alerts: React.FC<{}> = _ => {
  return (
    <NotificationSection
      content={[]}
      header="Alerts"
      emptyMessage="There are no threshold alerts since your last login."
    />
  );
};

export default React.memo(Alerts);
