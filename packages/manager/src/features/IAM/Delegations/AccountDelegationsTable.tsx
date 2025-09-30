import { Typography } from '@linode/ui';
import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
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
import { TruncatedList } from '../Shared/TruncatedList';

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
  const handleUpdateDelegations = () => {
    // Placeholder for future update delegations functionality
  };

  return (
    <Table
      aria-label="List of Account Delegations"
      sx={{ tableLayout: 'fixed' }}
    >
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
          delegations.map((delegation, key) => (
            <TableRow
              data-qa-table-row={delegation.euuid}
              key={`delegation-${delegation.euuid}-${key}`}
            >
              <TableCell>
                <Typography variant="body1">{delegation.company}</Typography>
              </TableCell>
              <TableCell
                sx={(theme) => ({
                  display: { sm: 'table-cell', xs: 'none' },
                  padding: theme.tokens.spacing.S8,
                })}
              >
                {'users' in delegation && delegation.users.length > 0 ? (
                  <TruncatedList
                    listContainerSx={{
                      gap: 0.5,
                      maxHeight: 24,
                      overflow: 'hidden',
                    }}
                  >
                    {delegation.users.map((user: string, index: number) => (
                      <Typography
                        color="textSecondary"
                        key={user}
                        variant="body1"
                      >
                        {user}
                        {index < delegation.users.length - 1 && ','}
                      </Typography>
                    ))}
                  </TruncatedList>
                ) : (
                  <Typography
                    sx={{ fontStyle: 'italic', textTransform: 'capitalize' }}
                    variant="body1"
                  >
                    no delegate users added
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <InlineMenuAction
                  actionText="Update Delegations"
                  buttonHeight={40}
                  onClick={handleUpdateDelegations}
                />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};
