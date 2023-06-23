import * as React from 'react';
import Pagination from '@mui/material/Pagination';

export interface Props {
  count: number;
  page: number;
  pageSize: number;
  onClickHandler: (page?: number) => void;
}

export const PaginationControls = (props: Props) => {
  const { count, onClickHandler, page, pageSize } = props;

  return (
    <Pagination
      count={Math.ceil(count / pageSize)}
      page={page}
      onChange={(_, page) => onClickHandler(page)}
      shape="rounded"
    />
  );
};
