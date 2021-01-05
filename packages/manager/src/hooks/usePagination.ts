import { useState } from 'react';
import { usePreferences } from 'src/hooks/usePreferences';

export const usePagination = (initialPage: number = 1) => {
  const { preferences, updatePreferences } = usePreferences();
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(preferences?.entity_page_size ?? 25);

  const updatePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    updatePreferences({ entity_page_size: newPageSize });
  };

  return {
    params: { page, pageSize },
    updatePageSize,
    updatePage: setPage
  };
};

export default usePagination;
