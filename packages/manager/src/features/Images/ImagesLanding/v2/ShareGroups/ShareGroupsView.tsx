import {
  useProfile,
  useShareGroupsQuery,
  useShareGroupTokensQuery,
} from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { CircleProgress, ErrorState } from '@linode/ui';
import { partition } from '@linode/utilities';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField/DebouncedSearchTextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { ShareGroupsTable } from './ShareGroupsTable';
import { SHAREGROUPS_CONFIG } from './shareGroupsTabsConfig';

import type { Handlers as ShareGroupHandlers } from './ShareGroupActionMenu';
import type { Filter, SharegroupToken } from '@linode/api-v4';
import type { ShareGroupsType } from 'src/features/Images/utils';
interface Props {
  handlers?: ShareGroupHandlers;
  type: ShareGroupsType;
}

export const ShareGroupsView = (props: Props) => {
  const { handlers, type } = props;
  const config = SHAREGROUPS_CONFIG[type];

  const isJoinedGroups = type === 'joined-groups';
  const isMembershipRequests = type === 'membership-requests';

  const shareGroupsTypeRoute = '/images/share-groups/$shareGroupsType';
  const navigate = useNavigate();
  const search = useSearch({
    from: '/images/share-groups/$shareGroupsType',
    shouldThrow: false,
  });
  const query = search?.query;

  const { data: profile } = useProfile();
  const isRestrictedUser = profile?.restricted;

  const pagination = usePaginationV2({
    currentRoute: shareGroupsTypeRoute,
    preferenceKey: config.preferenceKey,
    searchParams: (prev) => ({
      ...prev,
      query,
    }),
  });

  const { error: searchParseError, filter } = getAPIFilterFromQuery(query, {
    searchableFieldsWithoutOperator: ['label'],
  });

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
      from: shareGroupsTypeRoute,
    },
    preferenceKey: config.preferenceKey,
  });

  const shareGroupsFilter: Filter = {
    ['+order']: shareGroupsOrder,
    ['+order_by']: shareGroupsOrderBy,
    ...filter,
  };

  // Owned Groups
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

  // Joined/Requested Groups
  const {
    data: shareGroupTokens,
    error: shareGroupTokensError,
    isFetching: shareGroupTokensIsFetching,
  } = useShareGroupTokensQuery(
    { page: pagination.page, page_size: pagination.pageSize },
    { ...shareGroupsFilter },
    isJoinedGroups || isMembershipRequests
  );

  const isFetching =
    isJoinedGroups || isMembershipRequests
      ? shareGroupTokensIsFetching
      : shareGroupsIsFetching;

  const error =
    isJoinedGroups || isMembershipRequests
      ? shareGroupTokensError
      : shareGroupsError;

  const [joinedGroups, requestedGroups] = React.useMemo(() => {
    return partition(
      shareGroupTokens?.data ?? [],
      (token: SharegroupToken) => token.sharegroup_uuid !== null
    );
  }, [shareGroupTokens]);

  const onSearch = (query: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: query || undefined,
      }),
      to: shareGroupsTypeRoute,
      params: { shareGroupsType: type },
    });
  };

  if (shareGroupsLoading) {
    return <CircleProgress />;
  }

  if (!query && error) {
    return (
      <>
        <DocumentTitleSegment segment="Share groups" />
        <ErrorState errorText="There was an error loading your share groups. Please try again." />
      </>
    );
  }

  const handlePageChange = (event: CustomEvent<{ page: number }>) => {
    pagination.handlePageChange(Number(event.detail));
  };

  const handlePageSizeChange = (event: CustomEvent<{ pageSize: number }>) => {
    const newSize = event.detail.pageSize;
    pagination.handlePageSizeChange(newSize);
  };

  const tableHeaderProps = {
    title: config.title,
    buttonProps: config.buttonProps
      ? {
          buttonText: config.buttonProps.buttonText,
          onButtonClick: () =>
            navigate({
              search: () => ({}),
              to: config.buttonProps?.navigateTo ?? '/',
            }),
          disabled: isRestrictedUser,
          tooltipText: isRestrictedUser
            ? config.buttonProps.disabledToolTipText
            : undefined,
          pendoId: config.buttonProps.pendoId,
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
        errorText={searchParseError?.message}
        hideLabel
        isSearching={isFetching}
        label="Search"
        onSearch={onSearch}
        pendoId={config.searchFieldPendoId}
        placeholder="Search share groups"
        value={query ?? ''}
      />
      <ShareGroupsTable
        columns={config.columns}
        emptyMessage={config.emptyMessage}
        error={error}
        handleOrderChange={handleShareGroupsOrderChange}
        handlers={handlers}
        headerProps={tableHeaderProps}
        order={shareGroupsOrder}
        orderBy={shareGroupsOrderBy}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          count:
            isJoinedGroups || isMembershipRequests
              ? (shareGroupTokens?.results ?? 0)
              : (shareGroups?.results ?? 0),
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
        query={query}
        shareGroups={
          isJoinedGroups
            ? joinedGroups
            : isMembershipRequests
              ? requestedGroups
              : (shareGroups?.data ?? [])
        }
      />
    </>
  );
};
