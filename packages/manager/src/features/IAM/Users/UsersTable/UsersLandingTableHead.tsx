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
          style={{ width: '30%' }}
        >
          Username
        </TableSortCell>
        <TableSortCell
          active={order.orderBy === 'email'}
          direction={order.order}
          handleClick={order.handleOrderChange}
          label="email"
          style={{ width: '40%' }}
          sx={{ display: { sm: 'table-cell', xs: 'none' } }}
        >
          Email Address
        </TableSortCell>
        <TableCell
          style={{ width: '20%' }}
          sx={{ display: { lg: 'table-cell', xs: 'none' } }}
        >
          Last Login
        </TableCell>
        <TableCell style={{ width: '10%' }} />
      </TableRow>
    </TableHead>
  );
};
