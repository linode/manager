import { useMutatePreferences, usePreferences } from '@linode/queries';
import { useLocation, useNavigate } from '@tanstack/react-router';

import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';

export interface PaginationProps {
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
}

/**
 * usePagination hook
 * @param initialPage initial page to start on
 * @param preferenceKey a key used to store a user's prefered page size for a specific table
 * @param queryParamsPrefix a prefix that is applied to the query params in the url. Useful when this hook is used more than once on the same page.
 */
export const usePagination = (
  initialPage: number = 1,
  preferenceKey?: string,
  queryParamsPrefix?: string
): PaginationProps => {
  const { data: pageSizePreferences } = usePreferences(
    (preferences) => preferences?.pageSizes
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const navigate = useNavigate();
  const location = useLocation();

  const preferedPageSize = preferenceKey
    ? (pageSizePreferences?.[preferenceKey] ?? MIN_PAGE_SIZE)
    : MIN_PAGE_SIZE;
  const pageKey = queryParamsPrefix ? `${queryParamsPrefix}-page` : 'page';
  const pageSizeKey = queryParamsPrefix
    ? `${queryParamsPrefix}-pageSize`
    : 'pageSize';

  const searchParams: { [key: string]: any } = {
    ...location.search,
  };
  const searchParamPage = searchParams[pageKey];
  const searchParamPageSize = searchParams[pageSizeKey];

  const page = searchParamPage ? searchParamPage : initialPage;
  const pageSize = searchParamPageSize ? searchParamPageSize : preferedPageSize;

  const setPage = (p: number) => {
    searchParams[pageKey] = p;
    navigate({ to: location.pathname, search: searchParams });
  };

  const setPageSize = (size: number) => {
    searchParams[pageSizeKey] = size;
    navigate({ to: location.pathname, search: searchParams });
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
