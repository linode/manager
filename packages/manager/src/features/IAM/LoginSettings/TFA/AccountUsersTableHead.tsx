import {
  Checkbox,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { IAM_TFA_ENFORCE_PENDO_IDS } from '../constants';

type SortOrder = 'asc' | 'desc';

interface Order {
  handleOrderChange: (key: string, order?: SortOrder | undefined) => void;
  order: SortOrder;
  orderBy: string;
}
interface Props {
  disabled?: boolean;
  onSelectAll: () => void;
  order: Order;
  scopedOptionsLength: number;
  selectedScopedCount: number;
}

export const AccountUsersTableHead = ({
  disabled,
  onSelectAll,
  scopedOptionsLength,
  selectedScopedCount,
  order,
}: Props) => {
  const isSmUp = useBreakpoint('up', 'sm');

  return (
    <TableHead style={{ whiteSpace: 'nowrap' }}>
      <TableRow
        headerbackground={
          'var(--token-component-table-header-nested-background)'
        }
        headerborder
      >
        <TableHeaderCell style={{ minWidth: '3%', maxWidth: '7%' }}>
          <Checkbox
            checked={
              scopedOptionsLength > 0 &&
              selectedScopedCount >= scopedOptionsLength
            }
            data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.selectAllCurrentPage}
            disabled={disabled || scopedOptionsLength === 0}
            indeterminate={
              selectedScopedCount > 0 &&
              selectedScopedCount < scopedOptionsLength
            }
            onClick={() => {
              if (scopedOptionsLength > 0) {
                onSelectAll();
              }
            }}
            size="small"
            style={{ marginLeft: `-${Spacing.S12}` }}
          />
        </TableHeaderCell>
        <TableHeaderCell
          onSort={() =>
            order.handleOrderChange(
              'username',
              order.order === 'asc' ? 'desc' : 'asc'
            )
          }
          sortable
          sorted={order.orderBy === 'username' ? order.order : undefined}
          style={{ minWidth: '37%' }}
        >
          Username
        </TableHeaderCell>
        {isSmUp && (
          <TableHeaderCell
            onSort={() =>
              order.handleOrderChange(
                'email',
                order.order === 'asc' ? 'desc' : 'asc'
              )
            }
            sortable
            sorted={order.orderBy === 'email' ? order.order : undefined}
            style={{ minWidth: '60%' }}
          >
            Email
          </TableHeaderCell>
        )}
      </TableRow>
    </TableHead>
  );
};
