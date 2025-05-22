import { useProfile } from '@linode/queries';
import { Tooltip } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { capitalize, getFormattedStatus, truncate } from '@linode/utilities';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Markdown } from 'src/components/Markdown/Markdown';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';

import {
  maintenanceDateColumnMap,
  type MaintenanceTableType,
} from './MaintenanceTable';

import type { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

const statusTextMap: Record<AccountMaintenance['status'], string> = {
  completed: 'Completed',
  pending: 'Pending',
  started: 'In Progress',
  canceled: 'Canceled',
  'in-progress': 'In Progress',
  scheduled: 'Scheduled',
};

const statusIconMap: Record<AccountMaintenance['status'], Status> = {
  completed: 'inactive',
  pending: 'active',
  started: 'other',
  canceled: 'inactive',
  'in-progress': 'other',
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

  const truncatedReason = truncate(reason, 93);

  const isTruncated = reason !== truncatedReason;

  return (
    <TableRow key={entity.id}>
      <TableCell style={{ textTransform: 'capitalize' }}>
        {entity.type}
      </TableCell>
      <TableCell>
        <Link
          tabIndex={0}
          to={
            entity.type === 'linode'
              ? `/${entity.type}s/${entity.id}`
              : `/${entity.type}s`
          }
        >
          {entity.label}
        </Link>
      </TableCell>
      {(tableType === 'scheduled' || tableType === 'completed') && (
        <Hidden mdDown>
          <TableCell data-testid="relative-date">
            {parseAPIDate(when).toRelative()}
          </TableCell>
        </Hidden>
      )}
      <TableCell noWrap>
        {formatDate(props.maintenance[maintenanceDateColumnMap[tableType][0]], {
          timezone: profile?.timezone,
        })}
      </TableCell>

      <Hidden smDown>
        <TableCell noWrap>{getFormattedStatus(type)}</TableCell>
      </Hidden>
      {(tableType === 'scheduled' || tableType === 'completed') && (
        <TableCell statusCell>
          <StatusIcon status={statusIconMap[status] ?? 'other'} />
          {statusTextMap[status] ?? capitalize(status)}
        </TableCell>
      )}
      <Hidden lgDown>
        <TableCell>
          {isTruncated ? (
            <Tooltip title={<Markdown textOrMarkdown={reason} />}>
              <div>
                <Markdown textOrMarkdown={truncatedReason} />
              </div>
            </Tooltip>
          ) : (
            <Markdown textOrMarkdown={truncatedReason} />
          )}
        </TableCell>
      </Hidden>
    </TableRow>
  );
};
