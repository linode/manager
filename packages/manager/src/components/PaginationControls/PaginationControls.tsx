import Pagination from '@mui/material/Pagination';
import * as React from 'react';

export interface Props {
  /**
   * The number of items there are
   */
  count: number;
  /**
   * The action to perform for changing pages
   */
  onClickHandler: (page?: number) => void;
  /**
   * The page we are currently on
   */
  page: number;
  /**
   * The size of the page - how many items to display on each page
   */
  pageSize: number;
}

export const PaginationControls = (props: Props) => {
  const { count, onClickHandler, page, pageSize } = props;

  return (
    <Pagination
      count={Math.ceil(count / pageSize)}
      data-qa-pagination-controls
      onChange={(_, page) => onClickHandler(page)}
      page={page}
      shape="rounded"
    />
  );
};
