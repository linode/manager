import * as moment from 'moment';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { reportException } from 'src/exceptionReporting';
import { ExtendedEvent } from 'src/store/events/event.helpers';
import createLinkHandlerForNotification from 'src/utilities/getEventsActionLinkStrings';
import UserEventsListItem, {
  Props as UserEventsListItemProps
} from './UserEventsListItem';

const reportUnfoundEvent = (event: Linode.Event) =>
  process.env.NODE_ENV === 'production'
    ? reportException
    : // tslint:disable-next-line
      console.log('Unknown API event received.', {
        extra: { event }
      });

const reportEventError = (e: Linode.Event, err: Error) =>
  process.env.NODE_ENV === 'production'
    ? reportException(err)
    : console.log('Event Error', err); /* tslint:disable-line */

interface Props {
  events?: Linode.Event[];
  closeMenu: () => void;
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
          const title = eventMessageGenerator(
            event,
            reportUnfoundEvent as any,
            reportEventError
          );
          let content = `${moment(`${event.created}Z`).fromNow()}`;

          if (event.username) {
            content += ` by ${event.username}`;
          }

          const success = event.status !== 'failed' && !event.seen;
          const error = event.status === 'failed';

          const onClick = () => {
            closeMenu();
          };

          const linkPath = createLinkHandlerForNotification(
            event.action,
            event.entity,
            event._deleted
          );

          return title
            ? [...result, { title, content, success, error, onClick, linkPath }]
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

const enhanced = compose<any, any, any>(
  withRouter
);

export default enhanced(UserEventsList);
