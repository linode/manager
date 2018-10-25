import * as moment from 'moment';
import { compose, path } from 'ramda';
import * as Raven from 'raven-js';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

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

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  events?: Linode.Event[];
  closeMenu: () => void;
}

type CombinedProps = Props & RouteComponentProps<void> & WithStyles<ClassNames>;

const UserEventsList: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    events,
    closeMenu,
    history: { push },
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
            const onClick = createClickHandlerForNotification(
              event.action,
              event.entity,
              (s: string) => {
                closeMenu();
                push(s);
              }
            );

            return title ? [...result, { title, content, success, error, onClick }] : result;
          }, [])
          .map((reducedProps: UserEventsListItemProps, key: number) =>
            <UserEventsListItem key={key} {...reducedProps} />,
        )
      }
    </React.Fragment>
  );
};

const createClickHandlerForNotification = (
  action: Linode.EventAction,
  entity: null | Linode.Entity,
  onClick: (path: string) => void,
) => {
  const type = path(['type'], entity);
  const id = path(['id'], entity);

  /** If it's a deletion we have no where to go, so don't. */
  if (action.includes('_delete')) {
    return;
  }

  /** We require these bits of information to provide a link. */
  if (!type || !id) { return; }

  switch (type) {
    case 'linode':
      return (e: React.MouseEvent<HTMLElement>) => onClick(`/linodes/${id}`);

    case 'ticket':
      return (e: React.MouseEvent<HTMLElement>) => onClick(`/support/tickets/${id}`);

    case 'domain':
      return (e: React.MouseEvent<HTMLElement>) => onClick(`/domains/${id}`);

    case 'volume':
      return (e: React.MouseEvent<HTMLElement>) => onClick(`/volumes`);

    /** @todo When StackScriptDetail feature is complete */
    // case 'stackscript':
    //   return (e: React.MouseEvent<HTMLElement>) => onClick(``);

    case 'nodebalancer':
      switch (action) {
        case 'nodebalancer_config_create':
          return (e: React.MouseEvent<HTMLElement>) => onClick(`/nodebalancers/${id}/configurations`);

        default:
          return (e: React.MouseEvent<HTMLElement>) => onClick(`/nodebalancers/${id}/summary`);
      }

    default:
      return;
  }
};

const styled = withStyles(styles, { withTheme: true });

UserEventsList.defaultProps = {
  events: [],
};

const enhanced = compose<any, any, any>(styled, withRouter);

export default enhanced(UserEventsList);
