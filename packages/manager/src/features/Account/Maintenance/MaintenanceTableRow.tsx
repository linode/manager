import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import Link from 'src/components/Link';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import capitalize from 'src/utilities/capitalize';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import StatusIcon, { Status } from 'src/components/StatusIcon/StatusIcon';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import { parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';

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
      <TableCell noWrap>{formatDate(when)}</TableCell>
      <Hidden smDown>
        <TableCell data-testid="relative-date">
          {parseAPIDate(when).toRelative()}
        </TableCell>
      </Hidden>
      <Hidden xsDown>
        <TableCell noWrap>{capitalize(type.replace('_', ' '))}</TableCell>
      </Hidden>
      <TableCell statusCell>
        <StatusIcon status={statusIconMap[status] ?? 'other'} />
        {statusTextMap[status] ?? capitalize(status)}
      </TableCell>
      <Hidden mdDown>
        <TableCell>
          <HighlightedMarkdown textOrMarkdown={reason} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};
