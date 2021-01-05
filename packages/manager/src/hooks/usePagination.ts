import { useState } from 'react';
import { usePreferences } from 'src/hooks/usePreferences';

export interface PaginationProps<T> {
  page: number;
  pageSize: number;
  handlePageChange: (v: number, showSpinner?: boolean) => void;
  handlePageSizeChange: (v: number) => void;
}

export const usePagination = (
  initialPage: number = 1
): PaginationProps<any> => {
  const { preferences, updatePreferences } = usePreferences();
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(preferences?.entity_page_size ?? 25);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    updatePreferences({ entity_page_size: newPageSize });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return {
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange
  };
};

export default usePagination;
