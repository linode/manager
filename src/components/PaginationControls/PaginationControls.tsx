import * as React from 'react';
import { head, last } from 'ramda';

import PageButton from './PageButton';

interface Props {
  onClickHandler: (page?: number) => void;
  pages: number[];
  currentPage: number;
  first?: Boolean;
  last?: Boolean;
}

const PaginationControls: React.StatelessComponent<Props> = (props) => {
  const { onClickHandler, pages, currentPage } = props;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === pages.length;

  return (
    <div>
      { !isFirstPage && <PageButton first onClick={() => onClickHandler(head(pages)) } />}
      { pages.map((page, idx) =>
        <PageButton
          key={idx}
          page={page}
          active={page === currentPage}
          onClick={() => onClickHandler(page)}
        />,
        )
      }
      { !isLastPage && <PageButton last onClick={() => onClickHandler(last(pages)) } />}
    </div>
  );
};

export default PaginationControls;
