import { useGetAllChildAccountsQuery } from '@linode/queries';
import { CircleProgress, Paper, Stack } from '@linode/ui';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
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

  // TODO: UIE-9292 - replace this with API filtering
  const {
    data: allDelegations,
    error,
    isLoading,
  } = useGetAllChildAccountsQuery({
    params: {},
    users: true,
  });

  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('company');

  const handleOrderChange = (newOrderBy: string) => {
    if (orderBy === newOrderBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(newOrderBy);
      setOrder('asc');
    }
  };

  // Apply search filter
  const filteredDelegations = React.useMemo(() => {
    if (!allDelegations) return [];
    if (!query?.trim()) return allDelegations;

    const searchTerm = query.toLowerCase().trim();
    return allDelegations.filter((delegation) =>
      delegation.company?.toLowerCase().includes(searchTerm)
    );
  }, [allDelegations, query]);

  // Sort filtered data globally
  const sortedDelegations = React.useMemo(() => {
    if (!filteredDelegations.length) return [];

    return [...filteredDelegations].sort((a, b) => {
      const aValue = a.company || '';
      const bValue = b.company || '';

      const comparison = aValue.localeCompare(bValue, undefined, {
        numeric: true,
        sensitivity: 'base',
      });

      return order === 'asc' ? comparison : -comparison;
    });
  }, [filteredDelegations, order]);

  const pagination = usePaginationV2({
    currentRoute: DELEGATIONS_ROUTE,
    initialPage: 1,
    preferenceKey: ACCOUNT_DELEGATIONS_TABLE_PREFERENCE_KEY,
  });
  // Apply pagination to sorted data
  const paginatedDelegations = React.useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return sortedDelegations.slice(startIndex, endIndex);
  }, [sortedDelegations, pagination.page, pagination.pageSize]);

  const handleSearch = (value: string) => {
    // Reset to first page when searching
    pagination.handlePageChange(1);
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
          placeholder="Search accounts and users"
          value={query ?? ''}
        />
      </Stack>

      <AccountDelegationsTable
        delegations={paginatedDelegations}
        error={error}
        handleOrderChange={handleOrderChange}
        isLoading={isLoading}
        numCols={numCols}
        order={order}
        orderBy={orderBy}
      />
      <PaginationFooter
        count={sortedDelegations.length}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </Paper>
  );
};
