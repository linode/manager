import * as React from 'react';
import NotificationSection, { NotificationItem } from './NotificationSection';

interface Props {
  notificationsList: NotificationItem[];
  onClose?: () => void;
}

export const Notifications: React.FC<Props> = props => {
  const { notificationsList, onClose } = props;

  return (
    <NotificationSection
      content={notificationsList}
      header="Notifications"
      showMoreTarget={'/events'}
      emptyMessage="There are no notifications."
      onClose={onClose}
    />
  );
};

export default React.memo(Notifications);
