import { take } from 'ramda';
import * as React from 'react';
import withStyles, { StyleProps } from './PageNumbers.styles';

import PageButton, { Props as PageButtonProps } from 'src/components/PaginationControls/PageButton';

interface Props {
  currentPage: number;
  numOfPages: number;
  handlePageClick: (n: number) => void
}

const PageNumbers: React.StatelessComponent<Props & StyleProps> = (props) => {
  const { numOfPages, currentPage, classes, ...rest } = props;

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
        pageNumbersToRender(currentPage, numOfPages).map((eachPage) => (
          <PageNumber
            number={eachPage}
            data-qa-page-to={eachPage}
            key={eachPage}
            disabled={eachPage === currentPage}
            arial-label={`Page ${eachPage}`}
            {...rest}
          >
            {eachPage}
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
              number={numOfPages}
              data-qa-page-to={numOfPages}
              disabled={currentPage === numOfPages}
              arial-label={`Page ${numOfPages}`}
              {...rest}
            >
              {numOfPages}
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


/**
 * 
 * @param { number } currentPage - current page we're on 
 * @param { number } numOfPages - total number of pages returned from the API
 */
const pageNumbersToRender = (currentPage: number, numOfPages: number) => {
  /** creates an array of numbers, starting at 1, created from the numOfPages returned from API */
  const arrOfPageNumbers = Array.from(Array(numOfPages).keys()).map((value, index) => index + 1)
  /** return first 5 pages if we on a page under 5 */
  if (currentPage < 5) {
    return take(5, arrOfPageNumbers);
    /** return 2 pages below and 2 pages above current page  */
  } else if (currentPage >= 5 && currentPage <= numOfPages - 4) {
    return arrOfPageNumbers.slice(currentPage - 3, currentPage + 2);
  }

  /** otherwise just return the last 5 pages */
  return arrOfPageNumbers.slice(numOfPages - 5);
}