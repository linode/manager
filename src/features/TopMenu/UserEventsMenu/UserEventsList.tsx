import { captureException } from '@sentry/browser';
import * as moment from 'moment';
import { compose, path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import eventMessageGenerator from 'src/eventMessageGenerator';
import UserEventsListItem, { Props as UserEventsListItemProps } from './UserEventsListItem';

const reportUnfoundEvent = (event: Linode.Event) =>
  process.env.NODE_ENV === 'production'
    ? captureException
    : console.log('Unknown API event received.', { extra: { event } }); /* tslint:disable-line */

const reportEventError = (e: Linode.Event, err: Error) =>
  process.env.NODE_ENV === 'production'
    ? captureException(err)
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
        (events as ExtendedEvent[])
          .reduce((result, event): UserEventsListItemProps[] => {
            const title = eventMessageGenerator(event, reportUnfoundEvent, reportEventError);
            const content = event._deleted
              ? `Deleted ${moment(`${event.created}Z`).fromNow()} by ${event.username}`
              : `${moment(`${event.created}Z`).fromNow()} by ${event.username}`;

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
  deleted: undefined | string,
  onClick: (path: string) => void,
) => {
  const type = path(['type'], entity);
  const id = path(['id'], entity);

  if(['user_ssh_key_add','user_ssh_key_delete'].includes(action)){
    return (e: React.MouseEvent<HTMLElement>) => onClick(`/profile/keys`);
  }

  /**
   * If we have a deletion event or an event that is marked as referring to a deleted entityt
   * we don't want a clickable actin.
   */
  if (action.includes('_delete') || deleted) {
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

    case 'community_question':
      return () => { window.open(entity!.url, '_blank') };

    case 'community_like':
      return () => { window.open(entity!.url, '_blank') };

    default:
      return;
  }
};

const styled = withStyles(styles);

UserEventsList.defaultProps = {
  events: [],
};

const enhanced = compose<any, any, any>(styled, withRouter);

export default enhanced(UserEventsList);
