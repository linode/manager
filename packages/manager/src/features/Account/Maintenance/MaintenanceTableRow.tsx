import * as React from 'react';
import { Hidden } from 'src/components/Hidden';
import Tooltip from 'src/components/core/Tooltip';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { capitalize } from 'src/utilities/capitalize';
import { StatusIcon, Status } from 'src/components/StatusIcon/StatusIcon';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import { parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';
import { truncate } from 'src/utilities/truncate';
import { useProfile } from 'src/queries/profile';

const statusTextMap: Record<AccountMaintenance['status'], string> = {
  started: 'In Progress',
  pending: 'Scheduled',
  completed: 'Completed',
};

const statusIconMap: Record<AccountMaintenance['status'], Status> = {
  started: 'other',
  pending: 'active',
  completed: 'inactive',
};

export const MaintenanceTableRow = (props: AccountMaintenance) => {
  const { entity, when, type, status, reason } = props;

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
          to={
            entity.type === 'linode'
              ? `/${entity.type}s/${entity.id}`
              : `/${entity.type}s`
          }
          tabIndex={0}
        >
          {entity.label}
        </Link>
      </TableCell>
      <TableCell noWrap>
        {formatDate(when, {
          timezone: profile?.timezone,
        })}
      </TableCell>
      <Hidden mdDown>
        <TableCell data-testid="relative-date">
          {parseAPIDate(when).toRelative()}
        </TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell noWrap>{capitalize(type.replace('_', ' '))}</TableCell>
      </Hidden>
      <TableCell statusCell>
        <StatusIcon status={statusIconMap[status] ?? 'other'} />
        {statusTextMap[status] ?? capitalize(status)}
      </TableCell>
      <Hidden lgDown>
        <TableCell>
          {isTruncated ? (
            <Tooltip title={<HighlightedMarkdown textOrMarkdown={reason} />}>
              <div>
                <HighlightedMarkdown textOrMarkdown={truncatedReason} />
              </div>
            </Tooltip>
          ) : (
            <HighlightedMarkdown textOrMarkdown={truncatedReason} />
          )}
        </TableCell>
      </Hidden>
    </TableRow>
  );
};
