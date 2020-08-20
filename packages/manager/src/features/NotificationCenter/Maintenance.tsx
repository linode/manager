import * as React from 'react';
import NotificationSection, { NotificationItem } from './NotificationSection';

interface Props {
  statusNotifications: NotificationItem[];
}

export const Maintenance: React.FC<Props> = props => {
  const { statusNotifications } = props;
  return (
    <NotificationSection
      content={statusNotifications}
      header="System Status"
      showMoreText="View fleet status"
      showMoreTarget="https://status.linode.com"
      emptyMessage="All datacenters used by this account are online."
    />
  );
};

export default React.memo(Maintenance);
