import { useGetAllChildAccountsQuery } from '@linode/queries';
import { CircleProgress, Paper, Stack } from '@linode/ui';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { useFlags } from 'src/hooks/useFlags';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { AccountDelegationsTable } from './AccountDelegationsTable';

const DELEGATIONS_ROUTE = '/iam/delegations';

export const AccountDelegations = () => {
  const navigate = useNavigate();
  const flags = useFlags();
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
    data: childAccountsWithDelegates,
    error,
    isLoading,
  } = useGetAllChildAccountsQuery({
    params: {},
    users: true,
  });

  const pagination = usePaginationV2({
    currentRoute: '/iam/delegations',
    initialPage: 1,
    preferenceKey: 'iam-delegations-pagination',
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'company',
      },
      from: '/iam/delegations',
    },
    preferenceKey: 'iam-delegations-order',
  });

  // Apply search filter
  const filteredDelegations = React.useMemo(() => {
    if (!childAccountsWithDelegates) return [];
    if (!query?.trim()) return childAccountsWithDelegates;

    const searchTerm = query.toLowerCase().trim();
    return childAccountsWithDelegates.filter((delegation) =>
      delegation.company?.toLowerCase().includes(searchTerm)
    );
  }, [childAccountsWithDelegates, query]);

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

  const handleSearch = (value: string) => {
    pagination.handlePageChange(1);
    navigate({
      to: DELEGATIONS_ROUTE,
      search: { query: value || undefined },
    });
  };

  if (isLoading) {
    return <CircleProgress />;
  }
  if (!flags.iamDelegation?.enabled) {
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
          label="Search"
          onSearch={handleSearch}
          placeholder="Search"
          value={query ?? ''}
        />
      </Stack>

      <Paginate
        data={sortedDelegations}
        page={pagination.page}
        pageSize={pagination.pageSize}
        pageSizeSetter={pagination.handlePageSizeChange}
        updatePageUrl={pagination.handlePageChange}
      >
        {({
          count,
          data: paginatedData,
          handlePageChange,
          handlePageSizeChange,
        }) => (
          <>
            <AccountDelegationsTable
              delegations={paginatedData}
              error={error}
              handleOrderChange={handleOrderChange}
              isLoading={isLoading}
              numCols={numCols}
              order={order}
              orderBy={orderBy}
            />
            <PaginationFooter
              count={count}
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              page={pagination.page}
              pageSize={pagination.pageSize}
            />
          </>
        )}
      </Paginate>
    </Paper>
  );
};
