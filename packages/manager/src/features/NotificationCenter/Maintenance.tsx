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
      showMoreText="View status page"
      showMoreTarget="https://status.linode.com"
      emptyMessage="No outages or host maintenance pending."
    />
  );
};

export default React.memo(Maintenance);
