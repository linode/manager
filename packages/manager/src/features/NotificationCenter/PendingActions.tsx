import * as React from 'react';
import NotificationSection, { NotificationItem } from './NotificationSection';

interface Props {
  pendingActions: NotificationItem[];
}

export const PendingActions: React.FC<Props> = props => {
  const { pendingActions } = props;

  return (
    <NotificationSection
      content={pendingActions}
      header="Pending Actions"
      showMoreTarget={'/events'}
      emptyMessage="There are no pending actions."
    />
  );
};

export default React.memo(PendingActions);
