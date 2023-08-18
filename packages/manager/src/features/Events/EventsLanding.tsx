import { Event, getEvents } from '@linode/api-v4/lib/account';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import { concat, compose as rCompose, uniq } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { compose } from 'recompose';

import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { ApplicationState } from 'src/store';
import { setDeletedEvents } from 'src/store/events/event.helpers';
import { ExtendedEvent } from 'src/store/events/event.types';
import { removeBlocklistedEvents } from 'src/utilities/eventUtils';

import { filterUniqueEvents, shouldUpdateEvents } from './Event.helpers';
import { EventRow } from './EventRow';
import {
  StyledH1Header,
  StyledTableCell,
  StyledTypography,
} from './EventsLanding.styles';

interface Props {
  emptyMessage?: string; // Custom message for the empty state (i.e. no events).
  // isEventsLandingForEntity?: boolean;
  entityId?: number;
  errorMessage?: string; // Custom error message (for an entity's Activity page, for example)
  getEventsRequest?: typeof getEvents;
}

type CombinedProps = Props & StateProps;

const appendToEvents = (oldEvents: Event[], newEvents: Event[]) =>
  rCompose<Event[], Event[], Event[], Event[]>(
    uniq, // Ensure no duplicates
    concat(oldEvents), // Attach the new events
    setDeletedEvents // Add a _deleted entry for each new event
  )(newEvents);

export interface ReducerState {
  eventsFromRedux: ExtendedEvent[];
  inProgressEvents: Record<number, number>;
  mostRecentEventTime: string;
  reactStateEvents: Event[];
}

interface Payload {
  entityId?: number;
  eventsFromRedux: ExtendedEvent[];
  inProgressEvents: Record<number, number>;
  mostRecentEventTime: string;
  reactStateEvents: Event[];
}

export interface ReducerActions {
  payload: Payload;
  type: 'append' | 'prepend';
}

type EventsReducer = React.Reducer<ReducerState, ReducerActions>;

export const reducer: EventsReducer = (state, action) => {
  const {
    payload: {
      entityId,
      eventsFromRedux: nextReduxEvents,
      inProgressEvents: nextInProgressEvents,
      mostRecentEventTime: nextMostRecentEventTime,
      reactStateEvents: nextReactEvents,
    },
  } = action;

  switch (action.type) {
    case 'prepend':
      if (
        shouldUpdateEvents(
          {
            inProgressEvents: state.inProgressEvents,
            mostRecentEventTime: state.mostRecentEventTime,
          },
          {
            inProgressEvents: nextInProgressEvents,
            mostRecentEventTime: nextMostRecentEventTime,
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
            ...nextReduxEvents.filter((eachEvent) => {
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
              (eachEvent) => typeof eachEvent._initial === 'undefined'
            ),
          ]),
        };
      }
      return {
        eventsFromRedux: nextReduxEvents,
        inProgressEvents: nextInProgressEvents,
        mostRecentEventTime: nextMostRecentEventTime,
        reactStateEvents: nextReactEvents,
      };
    case 'append':
    default:
      return {
        eventsFromRedux: nextReduxEvents,
        inProgressEvents: nextInProgressEvents,
        mostRecentEventTime: nextMostRecentEventTime,
        reactStateEvents: appendToEvents(
          state.reactStateEvents,
          nextReactEvents
        ),
      };
  }
};

export const EventsLanding = (props: CombinedProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadMoreEvents, setLoadMoreEvents] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isRequesting, setRequesting] = React.useState<boolean>(false);
  const [initialLoaded, setInitialLoaded] = React.useState<boolean>(false);

  const [events, dispatch] = React.useReducer<EventsReducer>(reducer, {
    eventsFromRedux: props.eventsFromRedux,
    inProgressEvents: props.inProgressEvents,
    mostRecentEventTime: props.mostRecentEventTime,
    reactStateEvents: [],
  });

  const getNext = () => {
    if (isRequesting) {
      return;
    }
    setRequesting(true);

    const getEventsRequest = props.getEventsRequest || getEvents;

    getEventsRequest({ page: currentPage })
      .then(handleEventsRequestSuccess)
      .catch(() => {
        enqueueSnackbar('There was an error loading more events', {
          variant: 'error',
        });
        setLoading(false);
        setRequesting(false);
      });
  };

  const handleEventsRequestSuccess = (response: ResourcePage<Event>) => {
    setCurrentPage(currentPage + 1);
    setLoadMoreEvents(true);
    /** append our events to component state */
    dispatch({
      payload: {
        entityId: props.entityId,
        eventsFromRedux: props.eventsFromRedux,
        inProgressEvents: props.inProgressEvents,
        mostRecentEventTime: props.mostRecentEventTime,
        reactStateEvents: response.data,
      },
      type: 'append',
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
      .catch(() => {
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
      payload: {
        entityId: props.entityId,
        eventsFromRedux,
        inProgressEvents,
        mostRecentEventTime: props.mostRecentEventTime,
        reactStateEvents: events.reactStateEvents,
      },
      type: 'prepend',
    });
  }, [
    events.reactStateEvents,
    props,
    props.eventsFromRedux,
    props.inProgressEvents,
  ]);

  const { emptyMessage, entityId, errorMessage } = props;

  return (
    <>
      {/* Only display this title on the main Events landing page */}
      {!entityId && <StyledH1Header title="Events" />}
      <Table aria-label="List of Events">
        <TableHead>
          <TableRow>
            <Hidden smDown>
              <TableCell style={{ padding: 0, width: '1%' }} />
            </Hidden>
            <StyledTableCell data-qa-events-subject-header>
              Event
            </StyledTableCell>
            <StyledTableCell>Relative Date</StyledTableCell>
            <Hidden mdDown>
              <StyledTableCell data-qa-events-time-header>
                Absolute Date
              </StyledTableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderTableBody(
            loading,
            isRequesting,
            errorMessage,
            entityId,
            error,
            events.reactStateEvents,
            emptyMessage
          )}
        </TableBody>
      </Table>
      {loadMoreEvents && initialLoaded && !loading ? (
        <Waypoint onEnter={getNext}>
          <div />
        </Waypoint>
      ) : (
        !loading &&
        !error &&
        events.reactStateEvents.length > 0 && (
          <StyledTypography>No more events to show</StyledTypography>
        )
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
  events?: Event[],
  emptyMessage = "You don't have any events on your account."
) => {
  const filteredEvents = removeBlocklistedEvents(events, ['profile_update']);

  if (loading) {
    return (
      <TableRowLoading
        columns={4}
        responsive={{ 0: { xsDown: true }, 3: { smDown: true } }}
        rows={5}
      />
    );
  } else if (error) {
    return (
      <TableRowError
        colSpan={12}
        data-qa-events-table-error
        message={errorMessage}
      />
    );
  } else if (filteredEvents.length === 0) {
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
        {isRequesting && (
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
  eventsFromRedux: ExtendedEvent[];
  inProgressEvents: Record<number, number>;
  mostRecentEventTime: string;
}

const mapStateToProps = (state: ApplicationState) => ({
  eventsFromRedux: state.events.events,
  inProgressEvents: state.events.inProgressEvents,
  mostRecentEventTime: state.events.mostRecentEventTime,
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, Props>(connected);

export default enhanced(EventsLanding);
