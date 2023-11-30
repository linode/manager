import { Event } from '@linode/api-v4/lib/account';
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

import type { Filter } from '@linode/api-v4';

interface Props {
  emptyMessage?: string; // Custom message for the empty state (i.e. no events).
  entityId?: number;
}

export const EventsLanding = (props: Props) => {
  const { emptyMessage, entityId } = props;

  const filter: Filter = { action: { '+neq': 'profile_update' } };

  if (entityId) {
    filter['entity.id'] = entityId;
    filter['entity.type'] = 'linode';
  }

  const {
    error,
    events,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useEventsInfiniteQuery(filter);

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
        events &&
        events.length > 0 && (
          <StyledTypography>No more events to show</StyledTypography>
        )
      )}
    </>
  );
};

export const renderTableBody = (
  loading: boolean,
  isRequesting: boolean,
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
      <TableRowError colSpan={12} data-qa-events-table-error message={error} />
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
