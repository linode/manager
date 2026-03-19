import { useGetChildAccountsQuery } from '@linode/queries';
import { Notice, Paper, Stack } from '@linode/ui';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { useIsIAMDelegationEnabled } from '../hooks/useIsIAMEnabled';
import { usePermissions } from '../hooks/usePermissions';
import { AccountDelegationsTable } from './AccountDelegationsTable';

const DELEGATIONS_ROUTE = '/iam/delegations';

export const AccountDelegations = () => {
  const navigate = useNavigate();
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'account',
    ['list_all_child_accounts']
  );

  const { company } = useSearch({
    from: '/iam',
  });
  const theme = useTheme();

  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isLgDown = useMediaQuery(theme.breakpoints.up('lg'));

  const numColsLg = isLgDown ? 3 : 2;
  const numCols = isSmDown ? 2 : numColsLg;

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'company',
      },
      from: DELEGATIONS_ROUTE,
    },
    preferenceKey: 'iam-delegations-pagination',
  });

  const pagination = usePaginationV2({
    currentRoute: DELEGATIONS_ROUTE,
    preferenceKey: 'iam-delegations-pagination',
    initialPage: 1,
    searchParams: (prev) => ({
      ...prev,
      company: company || undefined,
    }),
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...(company && { company: { '+contains': company } }),
  };

  const {
    data: childAccountsWithDelegates,
    isFetching,
    isLoading,
    error,
  } = useGetChildAccountsQuery({
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    users: true,
    filter,
  });

  const handleSearch = (value: string) => {
    pagination.handlePageChange(1);
    navigate({
      to: DELEGATIONS_ROUTE,
      search: { company: value || undefined },
    });
  };

  if (!permissions?.list_all_child_accounts) {
    return (
      <Notice variant="error">
        You do not have permission to view account delegations.
      </Notice>
    );
  }

  if (!isIAMDelegationEnabled) {
    return null;
  }

  return (
    <Paper sx={(theme) => ({ marginTop: theme.tokens.spacing.S16 })}>
      <Stack
        direction={isSmDown ? 'column' : 'row'}
        justifyContent="space-between"
        marginBottom={2}
        spacing={2}
      >
        <DebouncedSearchTextField
          clearable
          containerProps={{
            sx: {
              width: '320px',
            },
          }}
          debounceTime={250}
          hideLabel
          isSearching={isFetching}
          label="Search"
          onSearch={handleSearch}
          placeholder="Search"
          value={company ?? ''}
        />
      </Stack>
      <AccountDelegationsTable
        delegations={childAccountsWithDelegates?.data ?? []}
        error={error}
        handleOrderChange={handleOrderChange}
        isLoading={isLoading || isPermissionsLoading}
        numCols={numCols}
        order={order}
        orderBy={orderBy}
      />
      <PaginationFooter
        count={childAccountsWithDelegates?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </Paper>
  );
};
