import { captureException } from '@sentry/browser';
import * as moment from 'moment';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { ExtendedEvent } from 'src/store/events/event.helpers';
import createClickHandlerForNotification from 'src/utilities/getEventsActionLink';
import UserEventsListItem, {
  Props as UserEventsListItemProps
} from './UserEventsListItem';

const reportUnfoundEvent = (event: Linode.Event) =>
  process.env.NODE_ENV === 'production'
    ? captureException
    : // tslint:disable-next-line
      console.log('Unknown API event received.', {
        extra: { event }
      });

const reportEventError = (e: Linode.Event, err: Error) =>
  process.env.NODE_ENV === 'production'
    ? captureException(err)
    : console.log('Event Error', err); /* tslint:disable-line */

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  events?: Linode.Event[];
  closeMenu: () => void;
}

type CombinedProps = Props & RouteComponentProps<void> & WithStyles<ClassNames>;

export const UserEventsList: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    events,
    closeMenu,
    history: { push }
  } = props;

  return (
    <React.Fragment>
      {(events as ExtendedEvent[])
        .reduce((result, event): UserEventsListItemProps[] => {
          const title = eventMessageGenerator(
            event,
            reportUnfoundEvent as any,
            reportEventError
          );
          const content = `${moment(`${event.created}Z`).fromNow()} by ${
            event.username
          }`;

          const success = event.status !== 'failed' && !event.seen;
          const error = event.status === 'failed';
          const onClick = createClickHandlerForNotification(
            event.action,
            event.entity,
            event._deleted,
            (s: string) => {
              closeMenu();
              push(s);
            }
          );

          return title
            ? [...result, { title, content, success, error, onClick }]
            : result;
        }, [])
        .map((reducedProps: UserEventsListItemProps, key: number) => (
          <UserEventsListItem key={key} {...reducedProps} />
        ))}
    </React.Fragment>
  );
};

const styled = withStyles(styles);

UserEventsList.defaultProps = {
  events: []
};

const enhanced = compose<any, any, any>(
  styled,
  withRouter
);

export default enhanced(UserEventsList);
