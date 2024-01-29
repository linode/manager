import * as React from 'react';
import { Link } from 'react-router-dom';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { Linode } from '@linode/api-v4';

interface Props {
  linode: Linode;
}

export const PlacementGroupsLinodesTableRow = React.memo((props: Props) => {
  const { linode } = props;
  const { label } = linode;

  return (
    <TableRow ariaLabel={`Linode`} data-testid={`placement-group-linode-`}>
      <TableCell>
        <Link tabIndex={0} to={`/linodes/{id}`}>
          {label}
        </Link>
      </TableCell>
      <TableCell actionCell>{/* actions */}</TableCell>
    </TableRow>
  );
});
