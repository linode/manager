import Pagination from '@mui/material/Pagination';
import * as React from 'react';

export interface Props {
  count: number;
  page: number;
  pageSize: number;
  onClickHandler: (page?: number) => void;
}

export const PaginationControls = (props: Props) => {
  const { count, page, pageSize, onClickHandler } = props;

  return (
    <Pagination
      count={Math.ceil(count / pageSize)}
      page={page}
      onChange={(_, page) => onClickHandler(page)}
      shape="rounded"
    />
  );
};
