import { Event } from '@linode/api-v4/lib/account';
import { Filter } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import Typography from 'src/components/core/Typography';
import { H1Header } from 'src/components/H1Header/H1Header';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { ApplicationState } from 'src/store';
import { ExtendedEvent } from 'src/store/events/event.types';
import areEntitiesLoading from 'src/store/selectors/entitiesLoading';
import { removeBlocklistedEvents } from 'src/utilities/eventUtils';
import EventRow from './EventRow';
import { useEventsInfiniteQuery } from 'src/queries/events';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
  noMoreEvents: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
  labelCell: {
    width: '60%',
    minWidth: 200,
    paddingLeft: 10,
    [theme.breakpoints.down('sm')]: {
      width: '70%',
    },
  },
  columnHeader: {
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
    color: theme.textColors.tableHeader,
  },
}));

interface Props {
  filter?: Filter;
  entityId?: number;
  errorMessage?: string; // Custom error message (for an entity's Activity page, for example)
  emptyMessage?: string; // Custom message for the empty state (i.e. no events).
}

type CombinedProps = Props & StateProps & WithSnackbarProps;

export const EventsLanding: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    data: eventsData,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useEventsInfiniteQuery(props.filter);

  const events = eventsData?.pages.reduce(
    (events, page) => [...events, ...page.data],
    []
  );

  const { entitiesLoading, errorMessage, entityId, emptyMessage } = props;
  const loading = isLoading || isFetchingNextPage || entitiesLoading;

  return (
    <>
      {/* Only display this title on the main Events landing page */}
      {!entityId && <H1Header title="Events" className={classes.header} />}
      <Table aria-label="List of Events">
        <TableHead>
          <TableRow>
            <Hidden smDown>
              <TableCell style={{ padding: 0, width: '1%' }} />
            </Hidden>
            <TableCell
              data-qa-events-subject-header
              className={`${classes.labelCell} ${classes.columnHeader}`}
            >
              Event
            </TableCell>
            <TableCell className={classes.columnHeader}>
              Relative Date
            </TableCell>
            <Hidden mdDown>
              <TableCell
                className={classes.columnHeader}
                data-qa-events-time-header
              >
                Absolute Date
              </TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderTableBody(
            loading,
            errorMessage,
            entityId,
            error ? 'Error' : undefined,
            events,
            emptyMessage
          )}
        </TableBody>
      </Table>
      {hasNextPage && events !== undefined && !loading ? (
        <Waypoint onEnter={() => fetchNextPage()}>
          <div />
        </Waypoint>
      ) : (
        !loading &&
        !error &&
        events &&
        events.length > 0 && (
          <Typography className={classes.noMoreEvents}>
            No more events to show
          </Typography>
        )
      )}
    </>
  );
};

export const renderTableBody = (
  loading: boolean,
  errorMessage = 'There was an error retrieving the events on your account.',
  entityId?: number,
  error?: string,
  events?: Event[],
  emptyMessage = "You don't have any events on your account."
) => {
  const filteredEvents = removeBlocklistedEvents(events, ['profile_update']);

  if (error) {
    return (
      <TableRowError
        colSpan={12}
        message={errorMessage}
        data-qa-events-table-error
      />
    );
  } else if (filteredEvents.length === 0 && !loading) {
    return (
      <TableRowEmptyState
        colSpan={12}
        message={emptyMessage}
        data-qa-events-table-empty
      />
    );
  } else {
    return (
      <>
        {filteredEvents.map((thisEvent, idx) => (
          <EventRow
            entityId={entityId}
            key={`event-list-item-${idx}`}
            event={thisEvent}
          />
        ))}
        {loading && (
          <TableRowLoading
            columns={4}
            rows={5}
            responsive={{ 0: { xsDown: true }, 3: { smDown: true } }}
          />
        )}
      </>
    );
  }
};

interface StateProps {
  entitiesLoading: boolean;
  inProgressEvents: Record<number, number>;
  eventsFromRedux: ExtendedEvent[];
  mostRecentEventTime: string;
}

const mapStateToProps = (state: ApplicationState) => ({
  entitiesLoading: areEntitiesLoading(state.__resources),
  inProgressEvents: state.events.inProgressEvents,
  eventsFromRedux: state.events.events,
  mostRecentEventTime: state.events.mostRecentEventTime,
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(connected, withSnackbar);

export default enhanced(EventsLanding);
