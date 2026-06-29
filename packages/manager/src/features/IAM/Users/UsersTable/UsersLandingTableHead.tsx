import {
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react';
import React from 'react';

import {
  getUsersTableCellStyle,
  useUsersTableColumns,
} from './usersTableColumnsUtils';

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
  const { columnWidths, showEmail, showLastLogin, showUserType } =
    useUsersTableColumns();

  return (
    <TableHead
      style={{
        whiteSpace: 'nowrap',
      }}
    >
      <TableRow
        headerbackground={
          'var(--token-component-table-header-nested-background)'
        }
        headerborder
      >
        <TableHeaderCell
          onSort={() =>
            order.handleOrderChange(
              'username',
              order.order === 'asc' ? 'desc' : 'asc'
            )
          }
          sortable
          sorted={order.orderBy === 'username' ? order.order : undefined}
          style={getUsersTableCellStyle(columnWidths.username)}
        >
          Username
        </TableHeaderCell>
        {showUserType && (
          <TableHeaderCell
            style={getUsersTableCellStyle(columnWidths.userType)}
          >
            User Type
          </TableHeaderCell>
        )}
        {showEmail ? (
          <TableHeaderCell
            onSort={() =>
              order.handleOrderChange(
                'email',
                order.order === 'asc' ? 'desc' : 'asc'
              )
            }
            sortable
            sorted={order.orderBy === 'email' ? order.order : undefined}
            style={getUsersTableCellStyle(columnWidths.email)}
          >
            Email Address
          </TableHeaderCell>
        ) : null}
        {showLastLogin ? (
          <TableHeaderCell
            style={getUsersTableCellStyle(columnWidths.lastLogin)}
          >
            Last Login
          </TableHeaderCell>
        ) : null}
        <TableHeaderCell style={getUsersTableCellStyle(columnWidths.actions)} />
      </TableRow>
    </TableHead>
  );
};
