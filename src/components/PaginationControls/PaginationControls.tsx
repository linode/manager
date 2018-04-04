import * as React from 'react';
import { slice } from 'ramda';

import PageButton from './PageButton';

interface Props {
  onClickHandler: (page?: number) => void;
  pages: number[] | number;
  range: number;
  currentPage: number;
  first?: Boolean;
  last?: Boolean;
}

const PaginationControls: React.StatelessComponent<Props> = (props) => {
  const { onClickHandler, pages: pagesProp, currentPage } = props;
  const pages = Array.isArray(pagesProp)
    ? pagesProp
    : Array.from(Array(pagesProp), (v, idx) => idx + 1);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === pages.length;
  const indexOf = pages.indexOf(currentPage);

  const displayedPages = createArrayWindow(
    props.range,
    indexOf,
    pages,
  );

  return (
    <div>
      <PageButton
        first
        disabled={isFirstPage}
        onClick={() => onClickHandler(currentPage - 1) }
        data-qa-prev-page
      />

      { displayedPages.map((page, idx) =>
        <PageButton
          key={idx}
          page={page}
          active={page === currentPage}
          onClick={() => onClickHandler(page)}
        />,
        )
      }

      <PageButton
        last
        disabled={isLastPage}
        onClick={() => onClickHandler(currentPage + 1) }
        data-qa-next-page
      />
    </div>
  );
};

function createArrayWindow<T>(
  range: number,
  position: number,
  list: T[],
): T[] {
  const pivot = Math.floor(range / 2);
  const start = (position + pivot) >= list.length
    ? list.length - range
    : Math.max(position - pivot, 0);

  return slice(start, start + range, list);
}
export default PaginationControls;
