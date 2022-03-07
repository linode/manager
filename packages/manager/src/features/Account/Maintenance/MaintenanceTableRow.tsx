import * as React from 'react';
import { AccountMaintenance } from '@linode/api-v4/lib/account/types';
import Hidden from 'src/components/core/Hidden';
import Link from 'src/components/Link';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import capitalize from 'src/utilities/capitalize';
import { parseAPIDate } from 'src/utilities/date';
import formatDate from 'src/utilities/formatDate';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';

const MaintenanceTableRow: React.FC<AccountMaintenance> = (props) => {
  const { entity, when, type, status, reason } = props;

  return (
    <TableRow key={entity.id}>
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
        <StatusIcon status={status == 'started' ? 'other' : 'inactive'} />
        {
          // @ts-expect-error api will change pending -> scheduled
          status === 'pending' || status === 'scheduled'
            ? 'Scheduled'
            : status === 'started'
            ? 'In Progress'
            : capitalize(status)
        }
      </TableCell>
      <Hidden mdDown>
        <TableCell>
          <HighlightedMarkdown textOrMarkdown={reason} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

export default MaintenanceTableRow;
