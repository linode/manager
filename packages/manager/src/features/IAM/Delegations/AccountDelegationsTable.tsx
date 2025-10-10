import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';

import { NO_DELEGATIONS_TEXT } from '../Shared/constants';
import { AccountDelegationsTableRow } from './AccountDelegationsTableRow';

import type {
  APIError,
  ChildAccount,
  ChildAccountWithDelegates,
} from '@linode/api-v4';

interface Props {
  delegations: ChildAccount[] | ChildAccountWithDelegates[] | undefined;
  error: APIError[] | null;
  handleOrderChange: (orderBy: string) => void;
  isLoading: boolean;
  numCols: number;
  order: 'asc' | 'desc';
  orderBy: string;
}

export const AccountDelegationsTable = ({
  delegations,
  error,
  handleOrderChange,
  isLoading,
  numCols,
  order,
  orderBy,
}: Props) => {
  return (
    <Table aria-label="List of Account Delegations">
      <TableHead
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        <TableRow>
          <TableSortCell
            active={orderBy === 'company'}
            direction={order}
            handleClick={() => handleOrderChange('company')}
            label="company"
            style={{ width: '27%' }}
          >
            Account
          </TableSortCell>
          <TableCell
            style={{ width: '53%' }}
            sx={{ display: { sm: 'table-cell', xs: 'none' } }}
          >
            Delegate Users
          </TableCell>
          <TableCell style={{ width: '20%' }} />
        </TableRow>
      </TableHead>
      <TableBody>
        {isLoading && <TableRowLoading columns={numCols} rows={3} />}
        {error && (
          <TableRowError colSpan={numCols} message={error[0]?.reason} />
        )}
        {!isLoading && !error && (!delegations || delegations.length === 0) && (
          <TableRowEmpty colSpan={numCols} message={NO_DELEGATIONS_TEXT} />
        )}
        {!isLoading &&
          !error &&
          delegations &&
          delegations.length > 0 &&
          delegations.map((delegation, index) => (
            <AccountDelegationsTableRow
              delegation={delegation}
              index={index}
              key={`delegation-${delegation.euuid}-${index}`}
            />
          ))}
      </TableBody>
    </Table>
  );
};
