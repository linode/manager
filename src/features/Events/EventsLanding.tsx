import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { compose as rCompose, concat, sort, uniq } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getEvents } from 'src/services/account';
import { ApplicationState } from 'src/store';
import { setDeletedEvents } from 'src/store/events/event.helpers';
import areEntitiesLoading from 'src/store/selectors/entitiesLoading';

import EventRow from './EventRow';

type ClassNames = 'root' | 'header' | 'noMoreEvents';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  header: {
    marginBottom: theme.spacing.unit
  },
  noMoreEvents: {
    padding: theme.spacing.unit * 4,
    textAlign: 'center'
  }
});

interface Props {
  title?: string;
  getEventsRequest?: typeof getEvents;
  isEntitySpecific?: boolean;
}

type CombinedProps = Props &
  StateProps &
  InjectedNotistackProps &
  WithStyles<ClassNames>;

const sortByCreated = (prevEvent: Linode.Event, nextEvent: Linode.Event) => {
  const a = prevEvent.created;
  const b = nextEvent.created;
  if (a > b) {
    return 1;
  }
  if (b < a) {
    return -1;
  }
  return 0;
};

const appendToEvents = (oldEvents: Linode.Event[], newEvents: Linode.Event[]) =>
  rCompose<
    Linode.Event[],
    Linode.Event[],
    Linode.Event[],
    Linode.Event[],
    Linode.Event[]
  >(
    uniq, // Ensure no duplicates
    sort(sortByCreated), // Ensure entries are sorted by date
    concat(oldEvents), // Attach the new events
    setDeletedEvents // Add a _deleted entry for each new event
  )(newEvents);

export const EventsLanding: React.StatelessComponent<CombinedProps> = props => {
  const [events, setEvents] = React.useState<Linode.Event[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadMoreEvents, setLoadMoreEvents] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isRequesting, setRequesting] = React.useState<boolean>(false);
  const [initialLoaded, setInitialLoaded] = React.useState<boolean>(false);

  const getNext = () => {
    if (isRequesting) {
      return;
    }
    setRequesting(true);

    const getEventsRequest = props.getEventsRequest || getEvents;

    getEventsRequest({ page: currentPage, pageSize: 50 })
      .then(handleEventsRequestSuccess)
      .catch(() => {
        props.enqueueSnackbar('There was an error loading more events', {
          variant: 'error'
        });
        setLoading(false);
        setRequesting(false);
      });
  };

  const handleEventsRequestSuccess = (
    response: Linode.ResourcePage<Linode.Event>
  ) => {
    setCurrentPage(currentPage + 1);
    setLoadMoreEvents(true);
    setEvents(appendToEvents(events, response.data));
    setLoading(false);
    setRequesting(false);
    setError(undefined);
    if (response.pages === currentPage) {
      setLoadMoreEvents(false);
    }
  };

  React.useEffect(() => {
    setLoading(true);
    setRequesting(true);
    setError(undefined);

    const getEventsRequest = props.getEventsRequest || getEvents;

    getEventsRequest()
      .then(handleEventsRequestSuccess)
      .then(() => setInitialLoaded(true))
      .catch(() => {
        setLoading(false);
        setError('Error');
      });
  }, []);

  const { classes, entitiesLoading, isEntitySpecific } = props;
  const isLoading = loading || entitiesLoading;

  return (
    <>
      <Typography variant="h1" className={classes.header}>
        {props.title || 'Events'}
      </Typography>
      <Paper>
        <Table aria-label="List of Events">
          <TableHead>
            <TableRow>
              <TableCell style={{ padding: 0, width: '1%' }} />
              <TableCell
                data-qa-events-subject-header
                style={{ minWidth: 200, paddingLeft: 10 }}
              >
                Event
              </TableCell>
              <TableCell data-qa-events-time-header>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableBody(
              isLoading,
              isRequesting,
              events,
              error,
              isEntitySpecific
            )}
          </TableBody>
        </Table>
      </Paper>
      {loadMoreEvents && (initialLoaded && !isLoading) ? (
        <Waypoint onEnter={getNext}>
          <div />
        </Waypoint>
      ) : (
        !isLoading &&
        (!error && (
          <Typography className={classes.noMoreEvents}>
            No more events to show
          </Typography>
        ))
      )}
    </>
  );
};

export const renderTableBody = (
  loading: boolean,
  isRequesting: boolean,
  events?: Linode.Event[],
  error?: string,
  isEntitySpecific?: boolean
) => {
  if (loading) {
    return <TableRowLoading colSpan={12} data-qa-events-table-loading />;
  } else if (error) {
    return (
      <TableRowError
        colSpan={12}
        message="There was an error retrieving the events on your account."
        data-qa-events-table-error
      />
    );
  } else if (!events || events.length === 0) {
    return (
      <TableRowEmptyState
        colSpan={12}
        message={"You don't have any events on your account."}
        data-qa-events-table-empty
      />
    );
  } else {
    return (
      <>
        {events.map((thisEvent, idx) => (
          <EventRow
            key={`event-list-item-${idx}`}
            event={thisEvent}
            shouldBeLink={!isEntitySpecific}
          />
        ))}
        {isRequesting && <TableRowLoading colSpan={12} transparent />}
      </>
    );
  }
};

const styled = withStyles(styles);

interface StateProps {
  entitiesLoading: boolean;
}

const mapStateToProps = (state: ApplicationState) => ({
  entitiesLoading: areEntitiesLoading(state.__resources)
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(
  styled,
  connected,
  withSnackbar
);

export default enhanced(EventsLanding);
