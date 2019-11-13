import { Event } from 'linode-js-sdk/lib/account';
import * as moment from 'moment';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { ExtendedEvent } from 'src/store/events/event.types';
import createLinkHandlerForNotification from 'src/utilities/getEventsActionLinkStrings';
import UserEventsListItem, {
  Props as UserEventsListItemProps
} from './UserEventsListItem';

interface Props {
  events?: Event[];
  closeMenu: (e: any) => void;
}

type CombinedProps = Props & RouteComponentProps<void>;

export const UserEventsList: React.StatelessComponent<
  CombinedProps
> = props => {
  const { events, closeMenu } = props;

  return (
    <React.Fragment>
      {(events as ExtendedEvent[])
        .reduce((result, event): UserEventsListItemProps[] => {
          const title = eventMessageGenerator(event);
          let content = `${moment(`${event.created}Z`).fromNow()}`;

          if (event.username) {
            content += ` by ${event.username}`;
          }

          const success = event.status !== 'failed' && !event.seen;
          const error = event.status === 'failed';
          const failedImage =
            event.action === 'disk_imagize' && event.status === 'failed';

          const helperText = failedImage
            ? 'This likely happened because your disk content was larger than the 2048 MB limit, or you attempted to imagize a raw or custom formatted disk.'
            : '';

          const linkPath = createLinkHandlerForNotification(
            event.action,
            event.entity,
            event._deleted
          );

          /**
           * Events without a link path either refer to a deleted
           * entity or else don't have an entity/anywhere to point.
           */
          const onClick = linkPath
            ? (e: any) => {
                closeMenu(e);
              }
            : undefined;

          return title
            ? [
                ...result,
                {
                  title,
                  content,
                  success,
                  error,
                  onClick,
                  linkPath,
                  helperText
                }
              ]
            : result;
        }, [])
        .map((reducedProps: UserEventsListItemProps, key: number) => (
          <UserEventsListItem key={key} {...reducedProps} />
        ))}
    </React.Fragment>
  );
};

UserEventsList.defaultProps = {
  events: []
};

const enhanced = compose<CombinedProps, Props>(withRouter);

export default enhanced(UserEventsList);
