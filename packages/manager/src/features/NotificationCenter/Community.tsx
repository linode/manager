import * as React from 'react';
import CommunityIcon from 'src/assets/community.svg';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import NotificationSection, { NotificationItem } from './NotificationSection';
import { Event } from '@linode/api-v4/lib/account';

interface Props {
  communityEvents: Event[];
}

type CombinedProps = Props;

export const Community: React.FC<CombinedProps> = props => {
  const { communityEvents } = props;

  const communityUpdates: NotificationItem[] = eventsToNotificationItems(
    communityEvents
  );

  return (
    <NotificationSection
      content={communityUpdates}
      header="Community Updates"
      icon={<CommunityIcon />}
    />
  );
};

const userHref = 'https://www.linode.com/community/user/';

const eventsToNotificationItems = (events: Event[]): NotificationItem[] => {
  return events
    .map(event => {
      const { entity } = event;
      // Safety check; entity will always be defined for these events
      if (!entity) {
        return null;
      }
      const eventLabel = entity.label;

      const id = `community-update-${entity.id}`;

      switch (event.action) {
        case 'community_question_reply':
          return {
            id,
            body: (
              <Typography>
                <Link to={`${userHref}${event.username}`}>
                  {event.username}
                </Link>{' '}
                replied to <Link to={`${entity.url}`}>{eventLabel}</Link>
              </Typography>
            ),
            timeStamp: event.created
          };

        case 'community_mention':
          return {
            id,
            body: (
              <Typography>
                <Link to={`${userHref}${event.username}`}>
                  {event.username}
                </Link>{' '}
                mentioned you in <Link to={`${entity.url}`}>{eventLabel}</Link>
              </Typography>
            ),
            timeStamp: event.created
          };

        case 'community_like':
          const [likeSummary, postTitle] = eventLabel.split(':');

          return {
            id,
            body: (
              <Typography>
                {likeSummary}: <Link to={`${entity.url}`}>{postTitle}</Link>
              </Typography>
            ),
            timeStamp: event.created
          };

        default:
          return null;
      }
    })
    .filter(Boolean) as NotificationItem[];
};

export default React.memo(Community);
