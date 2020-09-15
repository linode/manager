import * as React from 'react';
import NotificationSection, { NotificationItem } from './NotificationSection';

interface Props {
  communityEvents: NotificationItem[];
  loading: boolean;
  error: boolean;
}

type CombinedProps = Props;

export const Community: React.FC<CombinedProps> = props => {
  const { communityEvents, error, loading } = props;

  if (error) {
    return null;
  }

  return (
    <NotificationSection
      content={communityEvents}
      loading={loading}
      header="Community Updates"
      showMoreText="Visit the Community"
      showMoreTarget="https://linode.com/community"
      emptyMessage="There have been no updates to your discussion topics since your last visit."
    />
  );
};

export default React.memo(Community);
