import { Tooltip } from '@linode/ui';
import { capitalize, truncate } from '@linode/utilities';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Markdown } from 'src/components/Markdown/Markdown';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useProfile } from '@linode/queries';
import { parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';

import type { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

const statusTextMap: Record<AccountMaintenance['status'], string> = {
  completed: 'Completed',
  pending: 'Scheduled',
  started: 'In Progress',
};

const statusIconMap: Record<AccountMaintenance['status'], Status> = {
  completed: 'inactive',
  pending: 'active',
  started: 'other',
};

export const MaintenanceTableRow = (props: AccountMaintenance) => {
  const { entity, reason, status, type, when } = props;

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
