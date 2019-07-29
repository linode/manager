import * as moment from 'moment';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { ExtendedEvent } from 'src/store/events/event.helpers';
import getEventsActionLink from 'src/utilities/getEventsActionLink';
import UserEventsListItem, {
  Props as UserEventsListItemProps
} from './UserEventsListItem';

interface Props {
  events?: Linode.Event[];
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

          const onClick = getEventsActionLink(
            event.action,
            event.entity,
            event._deleted,
            (path: string) => {
              props.history.push(path);
              closeMenu(path);
            }
          );

          return title
            ? [
                ...result,
                {
                  title,
                  content,
                  success,
                  error,
                  onClick,
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
