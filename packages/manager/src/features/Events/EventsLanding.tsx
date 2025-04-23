import { createLazyRoute } from '@tanstack/react-router';
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
import { EVENTS_LIST_FILTER } from 'src/features/Events/constants';
import { useEventsInfiniteQuery } from 'src/queries/events/events';

import { EventRow } from './EventRow';
import {
  StyledH1Header,
  StyledLabelTableCell,
  StyledTableCell,
  StyledTypography,
} from './EventsLanding.styles';

import type { Filter } from '@linode/api-v4';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

interface Props {
  emptyMessage?: string; // Custom message for the empty state (i.e. no events).
  entityId?: number;
}

export const EventsLanding = (props: Props) => {
  const { emptyMessage, entityId } = props;

  const filter: Filter = { ...EVENTS_LIST_FILTER };

  if (entityId) {
    filter['entity.id'] = entityId;
    filter['entity.type'] = 'linode';
  }

  const {
    error,
    events,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useEventsInfiniteQuery(filter);

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          columns={4}
          responsive={{ 0: { xsDown: true }, 3: { smDown: true } }}
          rows={5}
        />
      );
    } else if (error) {
      return <TableRowError colSpan={12} message={error[0].reason} />;
    } else if (events && events.length === 0) {
      return (
        <TableRowEmpty
          colSpan={12}
          message={emptyMessage ?? "You don't have any events on your account."}
        />
      );
    } else {
      return (
        <>
          {events?.map((event) => (
            <EventRow
              entityId={entityId}
              event={event}
              key={`event-${event.id}`}
            />
          ))}
          {isFetchingNextPage && (
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

  return (
    <>
      <DocumentTitleSegment segment="Events" />
      {/* Only display this title on the main Events landing page */}
      {!entityId && <StyledH1Header title="Events" />}
      <Table aria-label="List of Events">
        <TableHead>
          <TableRow>
            <StyledLabelTableCell>Event</StyledLabelTableCell>
            <Hidden smDown>
              <TableCell data-qa-events-username-header sx={{ width: 150 }}>
                User
              </TableCell>
            </Hidden>
            <StyledTableCell sx={{ width: 175 }}>Start Date</StyledTableCell>
            <Hidden mdDown>
              <StyledTableCell data-qa-events-time-header sx={{ width: 175 }}>
                Duration
              </StyledTableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
      {!isFetching && hasNextPage && (
        <Waypoint onEnter={() => fetchNextPage()}>
          <div />
        </Waypoint>
      )}
      {events && events.length > 0 && !isFetching && !hasNextPage && (
        <StyledTypography>No more events to show</StyledTypography>
      )}
    </>
  );
};

export const eventsLandingLazyRoute = createLazyRoute('/events')({
  component: EventsLanding,
});
