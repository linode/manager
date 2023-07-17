import { Filter } from '@linode/api-v4';
import { Event, getEvents } from '@linode/api-v4/lib/account';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { compose } from 'recompose';

import { H1Header } from 'src/components/H1Header/H1Header';
import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Typography } from 'src/components/Typography';
import { useEventsInfiniteQuery } from 'src/queries/events';
import { ApplicationState } from 'src/store';
import areEntitiesLoading from 'src/store/selectors/entitiesLoading';
import {
  isInProgressEvent,
  removeBlocklistedEvents,
} from 'src/utilities/eventUtils';
import { partition } from 'src/utilities/partition';

import EventRow from './EventRow';

const useStyles = makeStyles((theme: Theme) => ({
  columnHeader: {
    color: theme.textColors.tableHeader,
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
  },
  header: {
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
  labelCell: {
    minWidth: 200,
    paddingLeft: 10,
    [theme.breakpoints.down('sm')]: {
      width: '70%',
    },
    width: '60%',
  },
  noMoreEvents: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
}));

interface EventsLandingProps {
  emptyMessage?: string;
  entityId?: number;
  errorMessage?: string; // Custom error message (for an entity's Activity page, for example)
  filter?: Filter;
  getEventsRequest?: typeof getEvents;
}

type CombinedProps = EventsLandingProps & StateProps;

export const EventsLanding = (props: CombinedProps) => {
  const {
    emptyMessage,
    entitiesLoading,
    entityId,
    errorMessage,
    filter,
  } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    events,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useEventsInfiniteQuery({ filter });

  const [inProgressEvents, completedEvents] = partition(
    isInProgressEvent,
    events ?? []
  );
  const sortedEvents = [...inProgressEvents, ...completedEvents];

  const loading = isLoading || isFetchingNextPage || entitiesLoading;

  React.useEffect(() => {
    if (error) {
      enqueueSnackbar('There was an error loading more events', {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, error]);

  return (
    <>
      {/* Only display this title on the main Events landing page */}
      {!entityId && <H1Header className={classes.header} title="Events" />}
      <Table aria-label="List of Events">
        <TableHead>
          <TableRow>
            <Hidden smDown>
              <TableCell style={{ padding: 0, width: '1%' }} />
            </Hidden>
            <TableCell
              className={`${classes.labelCell} ${classes.columnHeader}`}
              data-qa-events-subject-header
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
            sortedEvents,
            emptyMessage
          )}
        </TableBody>
      </Table>
      {hasNextPage && sortedEvents !== undefined && !loading ? (
        <Waypoint onEnter={() => fetchNextPage()}>
          <div />
        </Waypoint>
      ) : (
        !loading &&
        !error &&
        sortedEvents &&
        sortedEvents.length > 0 && (
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
        data-qa-events-table-error
        message={errorMessage}
      />
    );
  } else if (filteredEvents.length === 0 && !loading) {
    return (
      <TableRowEmpty
        colSpan={12}
        data-qa-events-table-empty
        message={emptyMessage}
      />
    );
  } else {
    return (
      <>
        {filteredEvents.map((thisEvent, idx) => (
          <EventRow
            entityId={entityId}
            event={thisEvent}
            key={`event-list-item-${idx}`}
          />
        ))}
        {loading && (
          <TableRowLoading
            columns={4}
            responsive={{ 0: { xsDown: true }, 3: { smDown: true } }}
            rows={5}
          />
        )}
      </>
    );
  }
};

interface StateProps {
  entitiesLoading: boolean;
}

const mapStateToProps = (state: ApplicationState) => ({
  entitiesLoading: areEntitiesLoading(state.__resources),
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, EventsLandingProps>(connected);

export default enhanced(EventsLanding);
