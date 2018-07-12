import * as moment from 'moment';
import * as Raven from 'raven-js';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import eventMessageGenerator from 'src/eventMessageGenerator';

import UserEventsListItem, { UserEventsListItemProps } from './UserEventsListItem';


const reportUnfoundEvent = (event: Linode.Event) =>
  process.env.NODE_ENV === 'production'
    ? Raven.captureException
    : console.log('Unknown API event received.', { extra: { event } }); /* tslint:disable-line */

const reportEventError = (e: Linode.Event, err: Error) =>
  process.env.NODE_ENV === 'production'
    ? Raven.captureException(err)
    : console.log('Event Error', err); /* tslint:disable-line */

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  events?: Linode.Event[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserEventsList: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    events,
  } = props;

  return (
    <React.Fragment>
      {
        (events as Linode.Event[])
          .reduce((result, event): UserEventsListItemProps[] => {
            const title = eventMessageGenerator(event, reportUnfoundEvent, reportEventError);
            const content = `${moment(`${event.created}Z`).fromNow()} by ${event.username}`;
            const success = event.status !== 'failed' && !event.seen;
            const error = event.status === 'failed';

            return title ? [...result, { title, content, success, error }] : result;
          }, [])
          .map((props: UserEventsListItemProps, key: number) =>
            <UserEventsListItem key={key} {...props} />,
        )
      }
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

UserEventsList.defaultProps = {
  events: [],
};

export default styled<Props>(UserEventsList);
