import * as React from 'react';
import PaginationControls from './PaginationControls';

export default {
  title: 'Components/Pagination Control',
};

export const PaginationControl = () => {
  const [page, setPage] = React.useState<number>(1);
  return (
    <PaginationControls
      count={250}
      page={page}
      onClickHandler={(pageNum: number) => setPage(pageNum)}
      pageSize={25}
    />
  );
};
