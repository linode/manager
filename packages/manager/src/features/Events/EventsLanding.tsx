import { Event, getEvents } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { Waypoint } from 'react-waypoint';

import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useEventsInfiniteQuery } from 'src/queries/events';

import { EventRow } from './EventRow';
import {
  StyledH1Header,
  StyledLabelTableCell,
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

export const EventsLanding = (props: Props) => {
  const {
    events,
    isLoading,
    hasNextPage,
    fetchNextPage,
    error,
    isFetchingNextPage
  } = useEventsInfiniteQuery();

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
            <StyledLabelTableCell data-qa-events-subject-header>
              Event
            </StyledLabelTableCell>
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
            isLoading,
            isFetchingNextPage,
            errorMessage,
            entityId,
            error?.[0].reason,
            events,
            emptyMessage
          )}
        </TableBody>
      </Table>
      {hasNextPage ? (
        <Waypoint onEnter={() => fetchNextPage()}>
          <div />
        </Waypoint>
      ) : (
        events && events.length > 0 && (
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
  } else if (events && events.length === 0) {
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
        {events?.map((thisEvent, idx) => (
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


export default EventsLanding;
