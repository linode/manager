import { useHistory, useLocation } from 'react-router-dom';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';

export interface PaginationProps {
  page: number;
  pageSize: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
}

export const usePagination = (
  initialPage: number = 1,
  preferenceKey?: string
): PaginationProps => {
  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchParamPage = searchParams.get('page');
  const searchParamPageSize = searchParams.get('pageSize');

  const page = searchParamPage ? Number(searchParamPage) : initialPage;
  const pageSize = searchParamPageSize
    ? Number(searchParamPageSize)
    : preferenceKey
    ? preferences?.pageSizes?.[preferenceKey] ?? 25
    : 25;

  const setPage = (p: number) => {
    searchParams.set('page', String(p));
    history.replace(`?${searchParams.toString()}`);
  };

  const setPageSize = (size: number) => {
    searchParams.set('pageSize', String(size));
    history.replace(`?${searchParams.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    if (preferenceKey) {
      updatePreferences({
        [preferenceKey]: undefined, // This may seem weird, but this cleans up the old format so user's preferences don't get too big
        pageSizes: {
          ...(preferences?.pageSizes ?? {}),
          [preferenceKey]: newPageSize,
        },
      });
    }
  };

  return {
    page,
    pageSize,
    handlePageChange: setPage,
    handlePageSizeChange,
  };
};
