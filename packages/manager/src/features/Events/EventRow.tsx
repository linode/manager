import { Event, EventAction } from '@linode/api-v4/lib/account';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import eventMessageGenerator from 'src/eventMessageGenerator';

import { getEntityByIDFromStore } from 'src/utilities/getEntityByIDFromStore';
import getEventsActionLink from 'src/utilities/getEventsActionLink';

import { formatEventWithUsername } from './Event.helpers';

import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';

const useStyles = makeStyles(() => ({
  message: {
    wordBreak: 'break-all'
  }
}));

interface ExtendedEvent extends Event {
  _deleted?: string;
}

interface Props {
  event: ExtendedEvent;
  entityId?: number;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const EventRow: React.FC<CombinedProps> = props => {
  const { event, entityId } = props;
  const type = pathOr<string>('linode', ['entity', 'type'], event);
  const id = pathOr<string | number>(-1, ['entity', 'id'], event);
  const entity = getEntityByIDFromStore(type, id);
  const linkTarget = getEventsActionLink(
    event.action,
    event.entity,
    event._deleted,
    (s: string) => props.history.push(s)
  );

  const rowProps = {
    created: event.created,
    linkTarget,
    message: eventMessageGenerator(event),
    status: pathOr(undefined, ['status'], entity),
    type,
    entityId,
    duration: event.duration,
    username: event.username,
    action: event.action
  };

  return <Row {...rowProps} data-qa-events-row={event.id} />;
};

export interface RowProps {
  message?: string | void;
  entityId?: number;
  linkTarget?: (e: React.MouseEvent<HTMLElement>) => void;
  type: 'linode' | 'domain' | 'nodebalancer' | 'stackscript' | 'volume';
  status?: string;
  action: EventAction;
  created: string;
  username: string | null;
  duration: Event['duration'];
}

export const Row: React.FC<RowProps> = props => {
  const classes = useStyles();

  const {
    action,
    entityId,
    linkTarget,
    message,
    status,
    type,
    created,
    username,
    duration
  } = props;

  /** Some event types may not be handled by our system (or new types
   * may be added). Filter these out so we don't display blank messages to the user.
   */
  if (!message) {
    return null;
  }

  const displayedMessage = formatEventWithUsername(action, username, message);

  return (
    <TableRow
      rowLink={entityId ? undefined : (linkTarget as any)}
      data-qa-event-row
      ariaLabel={`Event ${displayedMessage}`}
    >
      {/** We don't use the event argument, so typing isn't critical here. */}
      {/* Only display entity icon on the Global EventsLanding page */}
      {!entityId && (
        <TableCell data-qa-event-icon-cell>
          <Hidden smDown>
            <EntityIcon
              data-qa-entity-icon
              variant={type}
              status={status}
              size={28}
              marginTop={1}
            />
          </Hidden>
        </TableCell>
      )}
      <TableCell parentColumn={'Event'} data-qa-event-message-cell>
        <Typography
          className={classes.message}
          data-qa-event-message
          variant="body1"
        >
          {displayedMessage}
        </Typography>
      </TableCell>

      <TableCell parentColumn="Duration">
        <Typography variant="body1">
          {/* There is currently an API bug where host_reboot event durations are
          not reported correctly. This patch simply hides the duration. @todo
          remove this // check when the API bug is fixed. */}
          {action === 'host_reboot' ? '' : formatEventSeconds(duration)}
        </Typography>
      </TableCell>
      <TableCell parentColumn={'When'} data-qa-event-created-cell>
        <DateTimeDisplay value={created} />
      </TableCell>
    </TableRow>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(
  withRouter,
  renderGuard
);

export default enhanced(EventRow);
