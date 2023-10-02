import Pagination from '@mui/material/Pagination';
import * as React from 'react';

export interface Props {
  count: number;
  onClickHandler: (page?: number) => void;
  page: number;
  pageSize: number;
}

export const PaginationControls = (props: Props) => {
  const { count, onClickHandler, page, pageSize } = props;

  return (
    <Pagination
      data-qa-pagination-controls
      count={Math.ceil(count / pageSize)}
      onChange={(_, page) => onClickHandler(page)}
      page={page}
      shape="rounded"
    />
  );
};
