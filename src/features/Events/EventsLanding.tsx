import { withSnackbar, WithSnackbarProps } from 'notistack';
import { compose as rCompose, concat, uniq } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import {
  createStyles,
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
import withPerfMetrics, {
  Props as WithPerfMetricsProps
} from 'src/components/withPerfMetrics';
import { getEvents } from 'src/services/account';
import { ApplicationState } from 'src/store';
import { setDeletedEvents } from 'src/store/events/event.helpers';
import areEntitiesLoading from 'src/store/selectors/entitiesLoading';
import { removeBlacklistedEvents } from 'src/utilities/eventUtils';

import { ExtendedEvent } from 'src/store/events/event.helpers';
import { filterUniqueEvents, shouldUpdateEvents } from './Event.helpers';
import EventRow from './EventRow';

type ClassNames = 'root' | 'header' | 'labelCell' | 'timeCell' | 'noMoreEvents';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  header: {
    marginBottom: theme.spacing(1)
  },
  noMoreEvents: {
    padding: theme.spacing(4),
    textAlign: 'center'
  },
  labelCell: {
    width: '69%',
    minWidth: 200,
    paddingLeft: 10
  },
  timeCell: {
    width: '30%',
    paddingLeft: theme.spacing(1) / 2
  }
});

interface Props {
  getEventsRequest?: typeof getEvents;
  // isEventsLandingForEntity?: boolean;
  entityId?: number;
  errorMessage?: string; // Custom error message (for an entity's Activity page, for example)
}

type CombinedProps = Props &
  StateProps &
  WithSnackbarProps &
  WithStyles<ClassNames> &
  WithPerfMetricsProps;

const appendToEvents = (oldEvents: Linode.Event[], newEvents: Linode.Event[]) =>
  rCompose<Linode.Event[], Linode.Event[], Linode.Event[], Linode.Event[]>(
    uniq, // Ensure no duplicates
    concat(oldEvents), // Attach the new events
    setDeletedEvents // Add a _deleted entry for each new event
  )(newEvents);

export interface ReducerState {
  inProgressEvents: Record<number, number>;
  eventsFromRedux: ExtendedEvent[];
  reactStateEvents: Linode.Event[];
  mostRecentEventTime: string;
}

interface Payload {
  inProgressEvents: Record<number, number>;
  eventsFromRedux: ExtendedEvent[];
  reactStateEvents: Linode.Event[];
  mostRecentEventTime: string;
  entityId?: number;
}

export interface ReducerActions {
  type: 'append' | 'prepend';
  payload: Payload;
}

export const reducer: React.Reducer<ReducerState, ReducerActions> = (
  state,
  action
) => {
  const {
    payload: {
      eventsFromRedux: nextReduxEvents,
      inProgressEvents: nextInProgressEvents,
      reactStateEvents: nextReactEvents,
      mostRecentEventTime: nextMostRecentEventTime,
      entityId
    }
  } = action;

  switch (action.type) {
    case 'prepend':
      if (
        shouldUpdateEvents(
          {
            mostRecentEventTime: state.mostRecentEventTime,
            inProgressEvents: state.inProgressEvents
          },
          {
            mostRecentEventTime: nextMostRecentEventTime,
            inProgressEvents: nextInProgressEvents
          }
        )
      ) {
        return {
          eventsFromRedux: nextReduxEvents,
          inProgressEvents: nextInProgressEvents,
          mostRecentEventTime: nextMostRecentEventTime,
          reactStateEvents: filterUniqueEvents([
            /*
              Pop new events from Redux on the top of the event stream, with some conditions
            */
            ...nextReduxEvents.filter(eachEvent => {
              return (
                /** all events from Redux will have this flag as a boolean value */
                !eachEvent._initial &&
                /**
                 * so here we're basically determining whether or not
                 * an entityID prop was passed, and if so, only show the events
                 * that pertain to that entity. This is useful because it helps
                 * us show only relevant events on the Linode Activity panel, for example
                 */
                (typeof entityId === 'undefined' ||
                  (eachEvent.entity && eachEvent.entity.id === entityId))
              );
            }),
            /*
            at this point, the state is populated with events from the cDM
            request (which don't include the "_initial flag"), but it might also
            contain events from Redux as well. We only want the ones where the "_initial"
            flag doesn't exist
            */
            ...nextReactEvents.filter(
              eachEvent => typeof eachEvent._initial === 'undefined'
            )
          ])
        };
      }
      return {
        eventsFromRedux: nextReduxEvents,
        reactStateEvents: nextReactEvents,
        inProgressEvents: nextInProgressEvents,
        mostRecentEventTime: nextMostRecentEventTime
      };
    case 'append':
    default:
      return {
        reactStateEvents: appendToEvents(
          state.reactStateEvents,
          nextReactEvents
        ),
        eventsFromRedux: nextReduxEvents,
        inProgressEvents: nextInProgressEvents,
        mostRecentEventTime: nextMostRecentEventTime
      };
  }
};

export const EventsLanding: React.StatelessComponent<CombinedProps> = props => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadMoreEvents, setLoadMoreEvents] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isRequesting, setRequesting] = React.useState<boolean>(false);
  const [initialLoaded, setInitialLoaded] = React.useState<boolean>(false);

  const [events, dispatch] = React.useReducer<ReducerState, ReducerActions>(
    reducer,
    {
      inProgressEvents: props.inProgressEvents,
      eventsFromRedux: props.eventsFromRedux,
      reactStateEvents: [],
      mostRecentEventTime: props.mostRecentEventTime
    }
  );

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
    /** append our events to component state */
    dispatch({
      type: 'append',
      payload: {
        eventsFromRedux: props.eventsFromRedux,
        reactStateEvents: response.data,
        entityId: props.entityId,
        inProgressEvents: props.inProgressEvents,
        mostRecentEventTime: props.mostRecentEventTime
      }
    });
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
      .then(() => props.endPerfMeasurement())
      .catch(() => {
        props.endPerfMeasurement({ didFail: true });
        setLoading(false);
        setError('Error');
      });
  }, []);

  /**
   * For the purposes of concat-ing the events from Redux and React state
   * so we can display events in real-time
   */
  React.useEffect(() => {
    const { eventsFromRedux, inProgressEvents } = props;
    /** in this case, we're getting new events from Redux, so we want to prepend */
    dispatch({
      type: 'prepend',
      payload: {
        eventsFromRedux,
        inProgressEvents,
        reactStateEvents: events.reactStateEvents,
        entityId: props.entityId,
        mostRecentEventTime: props.mostRecentEventTime
      }
    });
  }, [props.eventsFromRedux, props.inProgressEvents]);

  const { classes, entitiesLoading, errorMessage, entityId } = props;
  const isLoading = loading || entitiesLoading;

  return (
    <>
      {/* Only display this title on the main Events landing page */}
      {!entityId && (
        <Typography variant="h1" className={classes.header}>
          Events
        </Typography>
      )}
      <Paper>
        <Table aria-label="List of Events">
          <TableHead>
            <TableRow>
              {/* Cell for icon (global EventsLanding only) */}
              {!entityId && <TableCell style={{ padding: 0, width: '1%' }} />}
              <TableCell
                data-qa-events-subject-header
                className={classes.labelCell}
              >
                Event
              </TableCell>
              <TableCell
                data-qa-events-time-header
                className={classes.timeCell}
              >
                Time
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableBody(
              isLoading,
              isRequesting,
              errorMessage,
              entityId,
              error,
              events.reactStateEvents
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
  errorMessage = 'There was an error retrieving the events on your account.',
  entityId?: number,
  error?: string,
  events?: Linode.Event[]
) => {
  const filteredEvents = removeBlacklistedEvents(events);

  if (loading) {
    return <TableRowLoading colSpan={12} data-qa-events-table-loading />;
  } else if (error) {
    return (
      <TableRowError
        colSpan={12}
        message={errorMessage}
        data-qa-events-table-error
      />
    );
  } else if (filteredEvents.length === 0) {
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
        {filteredEvents.map((thisEvent, idx) => (
          <EventRow
            entityId={entityId}
            key={`event-list-item-${idx}`}
            event={thisEvent}
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
  inProgressEvents: Record<number, number>;
  eventsFromRedux: ExtendedEvent[];
  mostRecentEventTime: string;
}

const mapStateToProps = (state: ApplicationState) => ({
  entitiesLoading: areEntitiesLoading(state.__resources),
  inProgressEvents: state.events.inProgressEvents,
  eventsFromRedux: state.events.events,
  mostRecentEventTime: state.events.mostRecentEventTime
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(
  withPerfMetrics('EventsLanding'),
  styled,
  connected,
  withSnackbar
);

export default enhanced(EventsLanding);
