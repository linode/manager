import { useProfile } from '@linode/queries';
import { Stack, Tooltip } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { capitalize, getFormattedStatus, truncate } from '@linode/utilities';
import * as React from 'react';

import { BarPercent } from 'src/components/BarPercent';
import { Link } from 'src/components/Link';
import { Markdown } from 'src/components/Markdown/Markdown';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import {
  formatProgressEvent,
  getEventMessage,
} from 'src/features/Events/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useInProgressEvents } from 'src/queries/events/events';
import { parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';

import {
  deriveMaintenanceStartISO,
  getMaintenanceDateField,
  getUpcomingRelativeLabel,
} from './utilities';

import type { MaintenanceTableType } from './MaintenanceTable';
import type { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

const statusTextMap: Record<AccountMaintenance['status'], string> = {
  completed: 'Completed',
  pending: 'Pending',
  started: 'In Progress',
  canceled: 'Canceled',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
};

const statusIconMap: Record<AccountMaintenance['status'], Status> = {
  completed: 'inactive',
  pending: 'active',
  started: 'other',
  canceled: 'inactive',
  in_progress: 'other',
  scheduled: 'active',
};

interface MaintenanceTableRowProps {
  maintenance: AccountMaintenance;
  tableType: MaintenanceTableType;
}

export const MaintenanceTableRow = (props: MaintenanceTableRowProps) => {
  const {
    maintenance: { entity, reason, status, type, when },
    tableType,
  } = props;

  const { data: profile } = useProfile();

  const { data: events } = useInProgressEvents();

  const flags = useFlags();

  const recentEvent =
    tableType === 'in progress'
      ? events?.find(
          (event) =>
            event.entity?.type === entity.type && event.entity.id === entity.id
        )
      : undefined;

  const eventProgress = recentEvent && formatProgressEvent(recentEvent);

  const truncatedReason = truncate(reason, 93);

  const isTruncated = reason !== truncatedReason;

  const dateField = getMaintenanceDateField(tableType);
  const dateValue = props.maintenance[dateField];

  // Precompute for potential use; currently used via getUpcomingRelativeLabel
  React.useMemo(
    () => deriveMaintenanceStartISO(props.maintenance),
    [props.maintenance]
  );

  const upcomingRelativeLabel = React.useMemo(() => {
    if (tableType !== 'upcoming') {
      return undefined;
    }
    return getUpcomingRelativeLabel(props.maintenance);
  }, [props.maintenance, tableType]);

  return (
    <TableRow key={entity.id}>
      <TableCell style={{ textTransform: 'capitalize' }}>
        {entity.type}
      </TableCell>
      <TableCell>
        {flags.vmHostMaintenance && recentEvent ? (
          <Stack direction="column" gap={1} marginY={1}>
            {getEventMessage(recentEvent)}
            {eventProgress?.showProgress && (
              <BarPercent
                max={100}
                narrow
                rounded
                sx={(theme) => ({ backgroundColor: theme.color.grey3 })}
                value={recentEvent.percent_complete ?? 0}
              />
            )}
          </Stack>
        ) : (
          <Link
            to={
              entity.type === 'linode'
                ? `/${entity.type}s/${entity.id}`
                : `/${entity.type}s`
            }
          >
            {entity.label}
          </Link>
        )}
      </TableCell>

      {flags.vmHostMaintenance?.enabled && (
        <>
          {(tableType === 'upcoming' || tableType === 'completed') && (
            <Hidden mdDown>
              <TableCell data-testid="relative-date">
                {tableType === 'upcoming'
                  ? upcomingRelativeLabel
                  : when
                    ? parseAPIDate(when).toRelative()
                    : '—'}
              </TableCell>
            </Hidden>
          )}
          <TableCell noWrap>
            {dateValue && typeof dateValue === 'string'
              ? formatDate(dateValue, { timezone: profile?.timezone })
              : '—'}
          </TableCell>
        </>
      )}

      {!flags.vmHostMaintenance?.enabled && (
        <>
          <TableCell noWrap>
            {when
              ? formatDate(when, {
                  timezone: profile?.timezone,
                })
              : '—'}
          </TableCell>
          <Hidden mdDown>
            <TableCell data-testid="relative-date">
              {tableType === 'upcoming'
                ? upcomingRelativeLabel
                : when
                  ? parseAPIDate(when).toRelative()
                  : '—'}
            </TableCell>
          </Hidden>
        </>
      )}

      <Hidden smDown>
        <TableCell noWrap>{getFormattedStatus(type)}</TableCell>
      </Hidden>
      {(!flags.vmHostMaintenance?.enabled ||
        tableType === 'upcoming' ||
        tableType === 'completed') && (
        <TableCell statusCell>
          <StatusIcon status={statusIconMap[status] ?? 'other'} />
          {statusTextMap[status] ?? capitalize(status)}
        </TableCell>
      )}
      <Hidden lgDown>
        <TableCell>
          {reason ? (
            isTruncated ? (
              <Tooltip title={<Markdown textOrMarkdown={reason} />}>
                <div>
                  <Markdown textOrMarkdown={truncatedReason} />
                </div>
              </Tooltip>
            ) : (
              <Markdown textOrMarkdown={truncatedReason} />
            )
          ) : (
            '—'
          )}
        </TableCell>
      </Hidden>
    </TableRow>
  );
};
