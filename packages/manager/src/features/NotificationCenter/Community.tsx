import * as React from 'react';
import { Link } from 'react-router-dom';
import CommunityIcon from 'src/assets/community.svg';
import Typography from 'src/components/core/Typography';
import NotificationSection, { NotificationItem } from './NotificationSection';
import { Event } from '@linode/api-v4/lib/account';

interface Props {
  communityEvents: Event[];
}

type CombinedProps = Props;

export const Community: React.FC<CombinedProps> = props => {
  const { communityEvents } = props;

  const communityUpdates: NotificationItem[] = communityEvents.map(
    communityEvent => eventToNotificationItem(communityEvent)
  );

  return (
    <NotificationSection
      content={communityUpdates}
      header="Community Updates"
      icon={<CommunityIcon />}
    />
  );
};

const eventToNotificationItem = (event: Event) => {
  const eventLabel = event.entity?.label;
  const postTitle = eventLabel?.split(':', 2)[1];

  if (event.action === 'community_question_reply') {
    return {
      id: event.entity?.id.toString(),
      body: (
        <Typography>
          <Link to="/">{event.username}</Link> replied to{' '}
          <Link to="/">{postTitle}</Link>
        </Typography>
      ),
      timeStamp: event.created
    };
  } else if (event.action === 'community_like') {
    return {
      id: event.entity?.id.toString(),
      body: (
        <Typography>
          <Link to="/">{event.username}</Link> liked{' '}
          <Link to="/">{postTitle}</Link>
        </Typography>
      ),
      timeStamp: event.created
    };
  } else {
    return {
      id: '',
      body: '',
      timeStamp: ''
    };
  }
};

export default React.memo(Community);
