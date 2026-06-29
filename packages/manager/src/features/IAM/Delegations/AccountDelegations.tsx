import {
  FormError,
  FormField,
  FormLabel,
  NotificationBanner,
  Pagination,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useGetChildAccountsQuery } from '@linode/queries';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React, { useCallback } from 'react';

import { DebouncedSearchField } from 'src/features/IAM/Shared/DebouncedSearchField/DebouncedSearchField';
import globalStyles from 'src/features/IAM/Shared/global.module.css';

import { useOrder } from '../hooks/useOrder';
import { usePagination } from '../hooks/usePagination';
import { usePermissions } from '../hooks/usePermissions';
import { Paper } from '../Shared/Paper/Paper';
import { AccountDelegationsTable } from './AccountDelegationsTable';

const DELEGATIONS_ROUTE = '/iam/delegations';
const MIN_PAGE_SIZE = 25;

export const AccountDelegations = () => {
  const navigate = useNavigate();
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'account',
    ['list_all_child_accounts']
  );

  const { company } = useSearch({
    from: '/iam',
  });

  const { handleOrderChange, order, orderBy } = useOrder({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'company',
      },
      from: DELEGATIONS_ROUTE,
    },
    preferenceKey: 'iam-delegations-pagination',
  });

  const pagination = usePagination({
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

  const handleSearch = useCallback(
    (value: string) => {
      pagination.handlePageChange(1);
      navigate({
        to: DELEGATIONS_ROUTE,
        search: { company: value || undefined },
      });
    },
    [navigate, pagination]
  );

  if (!permissions?.list_all_child_accounts) {
    return (
      <NotificationBanner
        text="You do not have permission to view account delegations."
        type="error"
      />
    );
  }

  return (
    <Paper>
      <FormField
        error={Boolean(error?.[0]?.reason)}
        labelPosition="top"
        style={{ padding: 0, marginBottom: Spacing.S16 }}
      >
        <FormLabel
          className={globalStyles.visuallyHidden}
          htmlFor="filter-delegations"
          slot="label"
        >
          Search Accounts
        </FormLabel>

        <DebouncedSearchField
          id="filter-delegations"
          isLoading={isFetching}
          onSearch={handleSearch}
          placeholder="Filter"
          style={{ padding: 0 }}
          value={company ?? ''}
        />
        <FormError slot="error">{error?.[0]?.reason}</FormError>
      </FormField>
      <AccountDelegationsTable
        delegations={childAccountsWithDelegates?.data ?? []}
        error={error}
        handleOrderChange={handleOrderChange}
        isLoading={isLoading || isPermissionsLoading}
        order={order}
        orderBy={orderBy}
      />
      <Pagination
        count={childAccountsWithDelegates?.results ?? 0}
        onPageChange={(e: CustomEvent<number>) =>
          pagination.handlePageChange(Number(e.detail))
        }
        onPageSizeChange={(
          e: CustomEvent<{ page: number; pageSize: number }>
        ) => pagination.handlePageSizeChange(Number(e.detail.pageSize))}
        page={pagination.page}
        pageSize={pagination.pageSize}
        pageSizes={[MIN_PAGE_SIZE, 50, 75, 100]}
        style={{ borderBottom: 0 }}
      />
    </Paper>
  );
};
