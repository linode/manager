import { Hidden } from '@linode/ui';
import React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

import type { Order } from './UsersLandingTableHead';

interface Props {
  order: Order;
}

export const UsersLandingProxyTableHead = ({ order }: Props) => {
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
        <TableCell />
      </TableRow>
    </TableHead>
  );
};
