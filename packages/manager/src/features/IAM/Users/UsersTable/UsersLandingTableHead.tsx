import { useProfile } from '@linode/queries';
import React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

import { useIsIAMDelegationEnabled } from '../../hooks/useIsIAMEnabled';

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
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const { data: profile } = useProfile();

  // Determine if the current user is a child account with isIAMDelegationEnabled enabled
  // If so, we need to show the 'User Type' column in the table
  const isChildWithDelegationEnabled =
    isIAMDelegationEnabled && Boolean(profile?.user_type === 'child');

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
        {isChildWithDelegationEnabled && (
          <TableCell
            style={{ width: '20%' }}
            sx={{ display: { lg: 'table-cell', xs: 'none' } }}
          >
            User Type
          </TableCell>
        )}
        <TableSortCell
          active={order.orderBy === 'email'}
          direction={order.order}
          handleClick={order.handleOrderChange}
          label="email"
          style={{ width: '20%' }}
          sx={{ display: { sm: 'table-cell', xs: 'none' } }}
        >
          Email Address
        </TableSortCell>
        <TableCell
          style={{ width: '15%' }}
          sx={{ display: { lg: 'table-cell', xs: 'none' } }}
        >
          Last Login
        </TableCell>
        <TableCell style={{ width: '10%' }} />
      </TableRow>
    </TableHead>
  );
};
