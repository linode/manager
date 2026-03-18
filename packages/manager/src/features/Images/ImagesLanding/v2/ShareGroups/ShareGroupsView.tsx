import { useProfile, useShareGroupsQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField/DebouncedSearchTextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { ShareGroupsTable } from './ShareGroupsTable';
import { SHAREGROUPS_CONFIG } from './shareGroupsTabsConfig';

import type { Filter } from '@linode/api-v4';
import type { ShareGroupsType } from 'src/features/Images/utils';

interface Props {
  type: ShareGroupsType;
}

export const ShareGroupsView = (props: Props) => {
  const { type } = props;
  const config = SHAREGROUPS_CONFIG['owned-groups'];
  const navigate = useNavigate();
  const search = useSearch({ from: '/images/share-groups' });

  const { data: profile } = useProfile();
  const isRestrictedUser = profile?.restricted;

  const pagination = usePaginationV2({
    currentRoute: '/images/share-groups/$shareGroupsType',
    preferenceKey: config.preferenceKey,
    searchParams: (prev) => ({
      ...prev,
      query: search.query,
    }),
  });

  const { error: searchParseError, filter } = getAPIFilterFromQuery(
    search.query,
    {
      searchableFieldsWithoutOperator: ['label'],
    }
  );

  const {
    handleOrderChange: handleShareGroupsOrderChange,
    order: shareGroupsOrder,
    orderBy: shareGroupsOrderBy,
  } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: config.orderDefault,
        orderBy: config.orderByDefault,
      },
      from: '/images/share-groups/$shareGroupsType',
    },
    preferenceKey: config.preferenceKey,
  });

  const shareGroupsFilter: Filter = {
    ['+order']: shareGroupsOrder,
    ['+order_by']: shareGroupsOrderBy,
    ...filter,
  };

  const {
    data: shareGroups,
    error: shareGroupsError,
    isFetching: shareGroupsIsFetching,
    isLoading: shareGroupsLoading,
  } = useShareGroupsQuery(
    { page: pagination.page, page_size: pagination.pageSize },
    {
      ...shareGroupsFilter,
    }
  );

  const onSearch = (query: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: query || undefined,
      }),
      to: '/images/share-groups/$shareGroupsType',
      params: { shareGroupsType: type },
    });
  };

  if (shareGroupsLoading) {
    return <CircleProgress />;
  }

  if (!search.query && shareGroupsError) {
    return (
      <>
        <DocumentTitleSegment segment="Share groups" />
        <ErrorState errorText="There was an error loading your share groups. Please try again." />
      </>
    );
  }

  const tableHeaderProps = {
    title: config.title,
    buttonProps: config.buttonProps
      ? {
          buttonText: config.buttonProps.buttonText,
          onButtonClick: () =>
            navigate({
              /* TODO: Implement OnButtonClick logic with follow-up ticket UIE-9410 */
              search: () => ({}),
              to: config.buttonProps?.navigateTo ?? '/',
            }),
          disabled: isRestrictedUser,
          tooltipText: isRestrictedUser
            ? config.buttonProps.disabledToolTipText
            : undefined,
        }
      : undefined,
    docsLink: config.docsLink,
    description: config.description,
  };

  return (
    <>
      <DebouncedSearchTextField
        clearable
        containerProps={{
          sx: {
            mb: 2,
          },
        }}
        data-pendo-id="Images Groups Owned-Search"
        errorText={searchParseError?.message}
        hideLabel
        isSearching={shareGroupsIsFetching}
        label="Search"
        onSearch={onSearch}
        placeholder="Search share groups"
        value={search.query ?? ''}
      />
      <ShareGroupsTable
        columns={config.columns}
        emptyMessage={config.emptyMessage}
        error={shareGroupsError}
        eventCategory={config.eventCategory}
        handleOrderChange={handleShareGroupsOrderChange}
        headerProps={tableHeaderProps}
        order={shareGroupsOrder}
        orderBy={shareGroupsOrderBy}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          count: shareGroups?.results ?? 0,
          handlePageChange: pagination.handlePageChange,
          handlePageSizeChange: pagination.handlePageSizeChange,
        }}
        query={search.query}
        shareGroups={shareGroups?.data ?? []}
      />
    </>
  );
};
