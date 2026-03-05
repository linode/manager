import { useMutatePreferences, usePreferences } from '@linode/queries';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';

import type { RegisteredRouter, ToSubOptions } from '@tanstack/react-router';
import type { TableSearchParams } from 'src/routes/types';

export interface PaginationPropsV2<D = unknown> {
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  paginatedData: D[];
}

export interface UsePaginationV2Props<T extends TableSearchParams> {
  /**
   * The route to which the pagination params are applied.
   */
  currentRoute: ToSubOptions['to'];
  /**
   * The default page size to use when no preference exists.
   * @default MIN_PAGE_SIZE
   *
   * @warning For API-driven data, this should be set to the minimum page size supported by the API (25 to 500).
   */
  defaultPageSize?: number;
  /**
   * The initial page pagination is set to - defaults to 1, it's unusual to set this.
   * @default 1
   */
  initialPage?: number;
  /**
   * A key used to store a user's preferred page size for a specific table.
   */
  preferenceKey: string;
  /**
   * A prefix that is applied to the query params in the url. Useful when this hook is used more than once on the same page.
   * ex: two different sortable tables on the same route.
   */
  queryParamsPrefix?: string;
  /**
   * A function that is called to build the search params for the route.
   */
  searchParams?: (prev: T) => T;
}

export const usePaginationV2 = <T extends TableSearchParams, D = unknown>({
  clientSidePaginationData,
  currentRoute,
  defaultPageSize = MIN_PAGE_SIZE,
  initialPage = 1,
  preferenceKey,
  queryParamsPrefix,
  searchParams,
}: UsePaginationV2Props<T> & {
  clientSidePaginationData?: D[] | undefined;
}): PaginationPropsV2<D> => {
  const { data: pageSizePreferences } = usePreferences(
    (preferences) => preferences?.pageSizes
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const search: TableSearchParams = useSearch({ strict: false });
  const navigate = useNavigate();

  const pageKey = queryParamsPrefix ? `${queryParamsPrefix}-page` : 'page';
  const pageSizeKey = queryParamsPrefix
    ? `${queryParamsPrefix}-pageSize`
    : 'pageSize';

  const searchParamPage =
    search[pageKey as keyof TableSearchParams] || search.page;
  const searchParamPageSize =
    search[pageSizeKey as keyof TableSearchParams] || search.pageSize;

  const preferredPageSize = preferenceKey
    ? (pageSizePreferences?.[preferenceKey] ?? defaultPageSize)
    : defaultPageSize;

  const page = searchParamPage ? Number(searchParamPage) : initialPage;
  const pageSize = searchParamPageSize
    ? Number(searchParamPageSize)
    : preferredPageSize;

  const setPage = React.useCallback(
    (page: number) => {
      navigate<RegisteredRouter, string, string>({
        search: (prev: TableSearchParams & T) => ({
          ...prev,
          ...(searchParams?.(prev) ?? {}),
          [pageKey]: page,
          ...(queryParamsPrefix ? {} : { page }),
        }),
        to: currentRoute,
      });
    },
    [currentRoute, pageKey, queryParamsPrefix, searchParams, navigate]
  );

  const setPageSize = (pageSize: number) => {
    navigate<RegisteredRouter, string, string>({
      search: (prev: TableSearchParams & T) => ({
        ...prev,
        ...(searchParams?.(prev) ?? {}),
        [pageSizeKey]: pageSize,
        ...(queryParamsPrefix ? {} : { pageSize }),
      }),
      to: currentRoute,
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    if (preferenceKey) {
      updatePreferences({
        pageSizes: {
          ...(pageSizePreferences ?? {}),
          [preferenceKey]: newPageSize,
        },
        [preferenceKey]: undefined, // This may seem weird, but this cleans up the old format so user's preferences don't get too big
      });
    }
  };

  const totalCount = clientSidePaginationData?.length;
  const maxPage =
    totalCount !== undefined
      ? Math.max(1, Math.ceil(totalCount / pageSize))
      : page;
  const clampedPage = Math.min(page, maxPage);

  const paginatedData = React.useMemo(() => {
    if (!clientSidePaginationData) return undefined;

    return clientSidePaginationData.slice(
      (clampedPage - 1) * pageSize,
      clampedPage * pageSize
    );
  }, [clientSidePaginationData, clampedPage, pageSize]);

  React.useEffect(() => {
    if (
      paginatedData !== undefined &&
      totalCount !== undefined &&
      totalCount > 0 &&
      clampedPage !== page
    ) {
      setPage(clampedPage);
    }
  }, [clampedPage, page, paginatedData, setPage, totalCount]);

  return {
    handlePageChange: setPage,
    handlePageSizeChange,
    page: clampedPage,
    pageSize,
    paginatedData: paginatedData ?? [],
  };
};
