import { useGetDelegatedChildAccountsForUserQuery } from '@linode/queries';
import { ErrorState, Paper, Stack, Typography } from '@linode/ui';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { useIsIAMDelegationEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { NO_ITEMS_TO_DISPLAY_TEXT } from 'src/features/IAM/Shared/constants';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';

import type { Theme } from '@mui/material';

const USER_DELEGATION_ROUTE = '/iam/users/$username/delegations';

export const UserDelegationsTable = () => {
  const { username } = useParams({ from: '/iam/users/$username' });
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const { company } = useSearch({
    from: USER_DELEGATION_ROUTE,
  });
  const navigate = useNavigate();

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'company',
      },
      from: USER_DELEGATION_ROUTE,
    },
    preferenceKey: 'user-delegations',
  });

  const pagination = usePaginationV2({
    currentRoute: USER_DELEGATION_ROUTE,
    preferenceKey: 'user-delegations',
    initialPage: 1,
    searchParams: (prev) => ({
      ...prev,
      company: company || undefined,
    }),
  });

  const filter = {
    company: {
      '+contains': company,
    },
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const {
    data: childAccounts,
    isFetching: isFetchingChildAccounts,
    isLoading: isLoadingChildAccounts,
    error: errorChildAccounts,
  } = useGetDelegatedChildAccountsForUserQuery({
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    username,
    filter,
  });

  const handleSearch = (value: string) => {
    pagination.handlePageChange(1);
    navigate({
      to: USER_DELEGATION_ROUTE,
      params: { username },
      search: { company: value || undefined },
    });
  };

  if (!isIAMDelegationEnabled) {
    return null;
  }

  if (isLoadingChildAccounts) {
    return <CircleProgress />;
  }

  if (errorChildAccounts) {
    return <ErrorState errorText={errorChildAccounts[0].reason} />;
  }

  return (
    <Paper>
      <Stack>
        <Typography variant="h2">Account Delegations</Typography>
        <DebouncedSearchTextField
          clearable
          debounceTime={250}
          hideLabel
          isSearching={isFetchingChildAccounts}
          label="Search"
          onSearch={handleSearch}
          placeholder="Search"
          sx={{ mt: 3 }}
          value={company ?? ''}
        />
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableSortCell
                active={orderBy === 'company'}
                direction={order}
                handleClick={handleOrderChange}
                label={'company'}
              >
                Account
              </TableSortCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {childAccounts?.data.length === 0 && (
              <TableRowEmpty colSpan={1} message={NO_ITEMS_TO_DISPLAY_TEXT} />
            )}
            {childAccounts?.data?.map((childAccount) => (
              <TableRow key={childAccount.euuid}>
                <TableCell>{childAccount.company}</TableCell>
              </TableRow>
            ))}
            {(childAccounts?.results ?? 0) > MIN_PAGE_SIZE && (
              <TableRow>
                <TableCell
                  colSpan={1}
                  sx={(theme: Theme) => ({
                    padding: 0,
                    '& > div': {
                      border: 'none',
                      borderTop: `1px solid ${theme.borderColors.divider}`,
                    },
                  })}
                >
                  <PaginationFooter
                    count={childAccounts?.results ?? 0}
                    eventCategory="DelegatedChildAccounts"
                    handlePageChange={pagination.handlePageChange}
                    handleSizeChange={pagination.handlePageSizeChange}
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
};
