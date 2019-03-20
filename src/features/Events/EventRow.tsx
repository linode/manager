import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import Hidden from 'src/components/core/Hidden';
import {
  StyleRulesCallback,
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

type ClassNames = 'tooltipWrapper' | 'helpIcon';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  tooltipWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  helpIcon: {
    width: 20,
    color: theme.color.grey1,
    marginLeft: theme.spacing.unit
  }
});

interface Props {
  event: Linode.Event;
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

export const EventRow: React.StatelessComponent<CombinedProps> = props => {
  const { event, classes } = props;
  const type = pathOr<string>('linode', ['entity', 'type'], event);
  const id = pathOr<string | number>(-1, ['entity', 'id'], event);
  const entity = getEntityByIDFromStore(type, id);

  const rowProps = {
    created: event.created,
    linkTarget: undefined, // no links for initial POC
    message: eventMessageGenerator(event),
    status: pathOr(undefined, ['status'], entity),
    type,
    classes
  };

  /** Some event types may not be handled by our system (or new types
   * may be added). Filter these out so we don't display blank messages to the user.
   */
  if (!rowProps.message) {
    return null;
  }

  return <Row {...rowProps} data-qa-events-row={event.id} />;
};

interface RowProps {
  message?: string;
  linkTarget?: (e: React.MouseEvent<HTMLElement>) => void;
  type: 'linode' | 'domain' | 'nodebalancer' | 'stackscript' | 'volume';
  status?: string;
  created: string;
}

const Row: React.StatelessComponent<
  RowProps & WithStyles<ClassNames>
> = props => {
  const { linkTarget, message, status, type, created } = props;

  return (
    <TableRow rowLink={linkTarget}>
      <Hidden smDown>
        <TableCell data-qa-event-icon-cell compact>
          <EntityIcon variant={type} status={status} size={28} marginTop={1} />
        </TableCell>
      </Hidden>
      <TableCell parentColumn={'Event'} data-qa-event-message-cell compact>
        <Typography variant="body1">{message}</Typography>
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
