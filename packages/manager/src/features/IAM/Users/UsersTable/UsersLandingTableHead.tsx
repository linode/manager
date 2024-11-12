import React from 'react';

import { Hidden } from 'src/components/Hidden';
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
}

export const UsersLandingTableHead = ({ order }: Props) => {
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
        <Hidden lgDown>
          <TableSortCell
            active={order.orderBy === 'last_login'}
            direction={order.order}
            handleClick={order.handleOrderChange}
            label="last_login"
          >
            Last Login
          </TableSortCell>
        </Hidden>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};
