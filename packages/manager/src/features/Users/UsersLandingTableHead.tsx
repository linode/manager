import { Hidden } from '@linode/ui';
import React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

export type SortOrder = 'asc' | 'desc';

export interface Order {
  handleOrderChange: (key: string, order?: SortOrder | undefined) => void;
  order: SortOrder;
  orderBy: string;
}

interface Props {
  order: Order;
  showChildAccountAccessCol: boolean;
}

export const UsersLandingTableHead = ({
  order,
  showChildAccountAccessCol,
}: Props) => {
  return (
    <TableHead
      sx={{
        whiteSpace: 'nowrap',
      }}
    >
      <TableRow>
        <TableSortCell
          active={order.orderBy === 'username'}
          direction={order.order}
          handleClick={order.handleOrderChange}
          label="username"
        >
          Username
        </TableSortCell>
        <Hidden smDown>
          <TableSortCell
            active={order.orderBy === 'email'}
            direction={order.order}
            handleClick={order.handleOrderChange}
            label="email"
          >
            Email Address
          </TableSortCell>
        </Hidden>
        <TableCell>Account Access</TableCell>
        {showChildAccountAccessCol && (
          <Hidden lgDown>
            <TableCell>Child Account Access</TableCell>
          </Hidden>
        )}
        <Hidden lgDown>
          <TableCell>Last Login</TableCell>
        </Hidden>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};
