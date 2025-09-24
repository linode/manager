import { useGetChildAccountsQuery } from '@linode/queries';
import { CircleProgress, Paper, Stack } from '@linode/ui';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { ACCOUNT_DELEGATIONS_TABLE_PREFERENCE_KEY } from '../Shared/constants';
import { AccountDelegationsTable } from './AccountDelegationsTable';

const DELEGATIONS_ROUTE = '/iam/delegations';

export const AccountDelegations = () => {
  const navigate = useNavigate();
  const { query } = useSearch({
    from: '/iam',
  });
  const theme = useTheme();

  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isLgDown = useMediaQuery(theme.breakpoints.up('lg'));

  const numColsLg = isLgDown ? 3 : 2;
  const numCols = isSmDown ? 2 : numColsLg;

  const pagination = usePaginationV2({
    currentRoute: DELEGATIONS_ROUTE,
    initialPage: 1,
    preferenceKey: ACCOUNT_DELEGATIONS_TABLE_PREFERENCE_KEY,
  });

  const order = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'desc',
        orderBy: 'company',
      },
      from: DELEGATIONS_ROUTE,
    },
    preferenceKey: `${ACCOUNT_DELEGATIONS_TABLE_PREFERENCE_KEY}-order`,
  });

  const {
    data: delegations,
    error,
    isLoading,
  } = useGetChildAccountsQuery({
    params: {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    users: true,
  });

  const handleSearch = (value: string) => {
    navigate({
      to: DELEGATIONS_ROUTE,
      search: { query: value },
    });
  };

  if (isLoading) {
    return <CircleProgress />;
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
          label="Search"
          onSearch={handleSearch}
          placeholder="Search"
          value={query ?? ''}
        />
      </Stack>

      <AccountDelegationsTable
        delegations={delegations?.data ?? []}
        error={error}
        isLoading={isLoading}
        numCols={numCols}
        order={order}
      />
      <PaginationFooter
        count={delegations?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </Paper>
  );
};
