import Pagination from '@mui/material/Pagination';
import * as React from 'react';

export interface Props {
  /**
   * The number of items there are to display
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
   * The size of the page - specifically, how many items to display on each page
   */
  pageSize: number;
}

/**
 * `PaginationControls` allows for pagination, enabling users to select a specific page from a range of pages. Note that this component
 * only handles pagination and not displaying the relevant data for each page.
 */
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
