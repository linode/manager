import { take } from 'ramda';
import * as React from 'react';
import withStyles, { StyleProps } from './PageNumbers.styles';

import PageButton, { Props as PageButtonProps } from 'src/components/PaginationControls/PageButton';

import { PageObject } from './PaginationControls';

interface Props {
  currentPage: number;
  pages: PageObject[]
  handlePageClick: (n: number) => void
}

const PageNumbers: React.StatelessComponent<Props & StyleProps> = (props) => {
  const { pages, currentPage, classes, ...rest } = props;

  const numOfPages = pages.length;

  return (
    <React.Fragment>
      {
        /** display "1 ... " if we're on a page higher than 5 */
        (currentPage >= 5)
          ? <React.Fragment>
            <PageNumber
              number={1}
              data-qa-page-to={1}
              disabled={currentPage === 1}
              arial-label={`Page 1`}
              {...rest}
            >
              1
            </PageNumber>
            <span className={classes.ellipses}>...</span>
          </React.Fragment>
          : null
      }
      {
        pageNumbersToRender(currentPage, pages).map(({ number, disabled }) => (
          <PageNumber
            number={number}
            data-qa-page-to={number}
            key={number}
            disabled={disabled}
            arial-label={`Page ${number}`}
            {...rest}
          >
            {number}
          </PageNumber>
        ))
      }
      {
        /** 
         * if we have more than 5 pages and we're on a page that is
         * not one of the last 5 pages, show " ... lastPage# " 
         */
        (numOfPages > 5 && currentPage <= numOfPages - 4)
          ? <React.Fragment>
            <span className={classes.ellipses}>...</span>
            <PageNumber
              number={pages.length}
              data-qa-page-to={pages.length}
              disabled={currentPage === pages.length}
              arial-label={`Page ${pages.length}`}
              {...rest}
            >
              {pages.length}
            </PageNumber>
          </React.Fragment>
          : null
      }
    </React.Fragment>
  )
};

export default withStyles(PageNumbers);

interface PageNumberProps extends PageButtonProps {
  number: number;
  handlePageClick: (n: number) => void;
}

export class PageNumber extends React.PureComponent<PageNumberProps> {
  onClick = () => this.props.handlePageClick(this.props.number);

  render() {
    const { onClick, children, handlePageClick, ...rest } = this.props;

    return (
      <PageButton {...rest} onClick={this.onClick}>
        {children}
      </PageButton>);
  }
};


const pageNumbersToRender = (currentPage: number, pages: PageObject[]) => {
  const numOfPages = pages.length;

  /** return first 5 pages if we on a page under 5 */
  if (currentPage < 5) {
    return take(5, pages);
    /** return 2 pages below and 2 pages above current page  */
  } else if (currentPage >= 5 && currentPage <= numOfPages - 4) {
    return pages.slice(currentPage - 3, currentPage + 2);
  }

  return pages.slice(numOfPages - 5);
}