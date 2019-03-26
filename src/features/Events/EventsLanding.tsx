import * as React from 'react';
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
import { setDeletedEvents } from 'src/store/events/event.helpers';

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

type CombinedProps = WithStyles<ClassNames>;

export const EventsLanding: React.StatelessComponent<CombinedProps> = props => {
  const [events, setEvents] = React.useState<Linode.Event[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadMoreEvents, setLoadMoreEvents] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isRequesting, setRequesting] = React.useState<boolean>(false);

  const getNext = () => {
    setRequesting(true);
    setCurrentPage(currentPage + 1);
    getEvents({ page: currentPage, pageSize: 50 }).then(
      handleEventsRequestSuccess
    );
  };

  const handleEventsRequestSuccess = (
    response: Linode.ResourcePage<Linode.Event>
  ) => {
    const newEvents = [...events, ...response.data];
    const eventsWithDeletions = setDeletedEvents(newEvents);
    setLoadMoreEvents(true);
    setEvents(eventsWithDeletions);
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
    getEvents().then(handleEventsRequestSuccess);
  }, []);

  const { classes } = props;

  return (
    <>
      <Typography variant="h1" className={classes.header}>
        Events
      </Typography>
      <Paper>
        <Table aria-label="List of Events">
          <TableHead>
            <TableRow>
              <TableCell style={{ padding: 0, width: '1%' }} />
              <TableCell
                data-qa-events-subject-header
                style={{ minWidth: 200 }}
              >
                Event
              </TableCell>
              <TableCell data-qa-events-time-header>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableBody(loading, isRequesting, events, error)}
          </TableBody>
        </Table>
      </Paper>
      {loadMoreEvents ? (
        <Waypoint onEnter={getNext}>
          <div style={{ minHeight: '150px' }} />
        </Waypoint>
      ) : (
        <Typography className={classes.noMoreEvents}>
          No more event to show
        </Typography>
      )}
    </>
  );
};

export const renderTableBody = (
  loading: boolean,
  isRequesting: boolean,
  events?: Linode.Event[],
  error?: string
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
          <EventRow key={`event-list-item-${idx}`} event={thisEvent} />
        ))}
        {isRequesting && <TableRowLoading colSpan={12} transparent />}
      </>
    );
  }
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(styled);

export default enhanced(EventsLanding);
