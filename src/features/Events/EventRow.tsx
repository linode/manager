import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import eventMessageGenerator from 'src/eventMessageGenerator';

import { getEntityByIDFromStore } from 'src/utilities/getEntityByIDFromStore';
import getEventsActionLink from 'src/utilities/getEventsActionLink';

type ClassNames = 'root' | 'message';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    message: {
      wordBreak: 'break-all',
      paddingLeft: 4
    }
  });

interface ExtendedEvent extends Linode.Event {
  _deleted?: string;
}

interface Props {
  event: ExtendedEvent;
  entityId?: number;
}

export const onUnfound = (event: ExtendedEvent) => {
  return `Event: ${event.action}${
    event.entity ? ` on ${event.entity.label}` : ''
  }`;
};

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

export const EventRow: React.StatelessComponent<CombinedProps> = props => {
  const { event, entityId, classes } = props;
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
    message: eventMessageGenerator(event, onUnfound),
    status: pathOr(undefined, ['status'], entity),
    type,
    entityId,
    username: event.username,
    classes
  };

  return <Row {...rowProps} data-qa-events-row={event.id} />;
};

export interface RowProps extends WithStyles<ClassNames> {
  message?: string | void;
  entityId?: number;
  linkTarget?: (e: React.MouseEvent<HTMLElement>) => void;
  type: 'linode' | 'domain' | 'nodebalancer' | 'stackscript' | 'volume';
  status?: string;
  created: string;
  username: string | null;
}

export const Row: React.StatelessComponent<RowProps> = props => {
  const {
    classes,
    entityId,
    linkTarget,
    message,
    status,
    type,
    created,
    username
  } = props;

  /** Some event types may not be handled by our system (or new types
   * may be added). Filter these out so we don't display blank messages to the user.
   */
  if (!message) {
    return null;
  }

  return (
    <TableRow rowLink={entityId ? undefined : (linkTarget as any)}>
      {/** We don't use the event argument, so typing isn't critical here. */}
      {/* Only display entity icon on the Global EventsLanding page */}
      {!entityId && (
        <TableCell data-qa-event-icon-cell compact>
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
      <TableCell parentColumn={'Event'} data-qa-event-message-cell compact>
        <Typography
          className={classes.message}
          data-qa-event-message
          variant="body1"
        >
          {username
            ? `${maybeRemoveTrailingPeriod(message)} by ${username}.`
            : message}
        </Typography>
      </TableCell>
      <TableCell parentColumn={'Time'} data-qa-event-created-cell compact>
        <DateTimeDisplay value={created} humanizeCutoff={'month'} />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(
  withRouter,
  renderGuard,
  styled
);

export default enhanced(EventRow);

export const maybeRemoveTrailingPeriod = (string: string) => {
  const lastChar = string[string.length - 1];
  if (lastChar === '.') {
    return string.substr(0, string.length - 1);
  }
  return string;
};
