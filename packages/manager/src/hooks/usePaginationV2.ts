import { useNavigate, useSearch } from '@tanstack/react-router';

import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import type { ToSubOptions } from '@tanstack/react-router';
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
  page_size: prev.page_size,
});

interface UsePaginationV2Props<T extends TableSearchParams> {
  currentRoute: ToSubOptions['to'];
  initialPage: number;
  preferenceKey: string;
  searchParams?: (prev: T) => T;
}

/**
 * usePagination hook
 * @param initialPage initial page to start on
 * @param preferenceKey a key used to store a user's prefered page size for a specific table
 * @param queryParamsPrefix a prefix that is applied to the query params in the url. Useful when this hook is used more than once on the same page.
 */
export const usePaginationV2 = <T extends TableSearchParams>({
  currentRoute,
  initialPage,
  preferenceKey,
  searchParams,
}: UsePaginationV2Props<T>): PaginationPropsV2 => {
  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const search: TableSearchParams = useSearch({ strict: false });
  const navigate = useNavigate();

  const searchParamPage = search.page;
  const searchParamPageSize = search.page_size;

  const preferredPageSize = preferenceKey
    ? preferences?.pageSizes?.[preferenceKey] ?? MIN_PAGE_SIZE
    : MIN_PAGE_SIZE;

  const page = searchParamPage ? Number(searchParamPage) : initialPage;
  const pageSize = searchParamPageSize
    ? Number(searchParamPageSize)
    : preferredPageSize;

  const setPage = (page: number) => {
    navigate({
      search: (prev: TableSearchParams & T) => ({
        ...setTableSearchParams(prev),
        ...(searchParams?.(prev) ?? {}),
        page,
      }),
      to: currentRoute,
    });
  };

  const setPageSize = (size: number) => {
    navigate({
      search: (prev: TableSearchParams & T) => ({
        ...setTableSearchParams(prev),
        ...(searchParams?.(prev) ?? {}),
        page_size: size,
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
          ...(preferences?.pageSizes ?? {}),
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
