import { useMutatePreferences, usePreferences } from '@linode/queries';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';

import type { RegisteredRouter, ToSubOptions } from '@tanstack/react-router';
import type { TableSearchParams } from 'src/routes/types';

export interface PaginationPropsV2 {
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
}

const setTableSearchParams = (prev: TableSearchParams) => ({
  order: prev.order,
  orderBy: prev.orderBy,
  page: prev.page,
  pageSize: prev.pageSize,
});

export interface UsePaginationV2Props<T extends TableSearchParams> {
  /**
   * The route to which the pagination params are applied.
   */
  currentRoute: ToSubOptions['to'];
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

export const usePaginationV2 = <T extends TableSearchParams>({
  currentRoute,
  initialPage = 1,
  preferenceKey,
  queryParamsPrefix,
  searchParams,
}: UsePaginationV2Props<T>): PaginationPropsV2 => {
  const { data: pageSizePreferences } = usePreferences(
    (preferences) => preferences?.pageSizes
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const search: TableSearchParams = useSearch({ strict: false });
  const navigate = useNavigate();

  const searchParamPage = search.page;
  const searchParamPageSize = search.pageSize;

  const pageKey = queryParamsPrefix ? `${queryParamsPrefix}-page` : 'page';
  const pageSizeKey = queryParamsPrefix
    ? `${queryParamsPrefix}-pageSize`
    : 'pageSize';

  const preferredPageSize = preferenceKey
    ? pageSizePreferences?.[preferenceKey] ?? MIN_PAGE_SIZE
    : MIN_PAGE_SIZE;

  const page = searchParamPage ? Number(searchParamPage) : initialPage;
  const pageSize = searchParamPageSize
    ? Number(searchParamPageSize)
    : preferredPageSize;

  const setPage = (page: number) => {
    navigate<RegisteredRouter, string, string>({
      search: (prev: TableSearchParams & T) => ({
        ...setTableSearchParams(prev),
        ...(searchParams?.(prev) ?? {}),
        [pageKey]: page,
        ...(queryParamsPrefix ? {} : { page }),
      }),
      to: currentRoute,
    });
  };

  const setPageSize = (pageSize: number) => {
    navigate<RegisteredRouter, string, string>({
      search: (prev: TableSearchParams & T) => ({
        ...setTableSearchParams(prev),
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

  return {
    handlePageChange: setPage,
    handlePageSizeChange,
    page,
    pageSize,
  };
};
