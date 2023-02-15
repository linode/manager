import { useState } from 'react';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';

export interface PaginationProps<T> {
  page: number;
  pageSize: number;
  handlePageChange: (v: number, showSpinner?: boolean) => void;
  handlePageSizeChange: (v: number) => void;
}

export const usePagination = (
  initialPage: number = 1,
  preferenceKey?: string
): PaginationProps<any> => {
  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(
    preferences?.[preferenceKey ?? -1] ?? 25
  );

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    if (preferenceKey) {
      updatePreferences({ [preferenceKey]: newPageSize });
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return {
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
};

export default usePagination;
