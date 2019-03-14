import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import Hidden from 'src/components/core/Hidden';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import eventMessageGenerator from 'src/eventMessageGenerator';
import getEventsActionLink from 'src/utilities/getEventsActionLink';

import { getEntityByIDFromStore } from 'src/utilities/getEntityByIDFromStore';

interface Props {
  event: Linode.Event;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const EventRow: React.StatelessComponent<CombinedProps> = props => {
  const { event } = props;
  const type = pathOr<string>('linode', ['entity', 'type'], event);
  const id = pathOr<string | number>(-1, ['entity', 'id'], event);
  const entity = getEntityByIDFromStore(type, id);
  // Community likes and questions don't have an "entity" but they do have a link
  const linkTarget =
    ['community_like', 'community_question'].includes(type) || entity
      ? getEventsActionLink(event.action, event.entity, false, (s: string) =>
          props.history.push(s)
        )
      : undefined;
  const rowProps = {
    created: event.created,
    linkTarget,
    message: eventMessageGenerator(event),
    status: pathOr(undefined, ['status'], entity),
    type
  };

  /** Some event types may not be handled by our system (or new types
   * may be added). Filter these out so we don't display blank messages to the user.
   */
  if (!rowProps.message) {
    return null;
  }

  return (
    <>
      {Boolean(linkTarget) ? (
        // This row has an entity/external target to link to.
        <Row {...rowProps} data-qa-events-row={event.id} />
      ) : (
        // This one doesn't. Usually that means the entity has been deleted.
        <Tooltip title="The entity for this event no longer exists.">
          <Row {...rowProps} data-qa-events-row={event.id} />
        </Tooltip>
      )}
    </>
  );
};

interface RowProps {
  message?: string;
  linkTarget?: (e: React.MouseEvent<HTMLElement>) => void;
  type: 'linode' | 'domain' | 'nodebalancer' | 'stackscript' | 'volume';
  status?: string;
  created: string;
}

const Row: React.StatelessComponent<RowProps> = props => {
  const { linkTarget, message, status, type, created } = props;

  return (
    <TableRow rowLink={linkTarget}>
      <Hidden smDown>
        <TableCell data-qa-event-icon-cell>
          <EntityIcon variant={type} status={status} />
        </TableCell>
      </Hidden>
      <TableCell parentColumn={'Event'} data-qa-event-message-cell>
        <Typography variant="body1">{message}</Typography>
      </TableCell>
      <TableCell parentColumn={'Time'} data-qa-event-created-cell>
        <DateTimeDisplay value={created} humanizeCutoff={'month'} />
      </TableCell>
    </TableRow>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(
  withRouter,
  renderGuard
);

export default enhanced(EventRow);
