import { take } from 'ramda';
import * as React from 'react';
import { debounce } from 'throttle-debounce';
import withStyles, { StyleProps } from './PageNumbers.styles';

import windowIsNarrowerThan from 'src/utilities/breakpoints';

import PageButton, {
  Props as PageButtonProps
} from 'src/components/PaginationControls/PageButton';

interface Props {
  currentPage: number;
  numOfPages: number;
  handlePageClick: (n: number) => void;
}

class PageNumbers extends React.PureComponent<Props & StyleProps> {
  forceRefresh = debounce(400, false, () => {
    /**
     * forcing update because we want the shown page numbers to update
     * based on screen size. See pageNumbersToRender() function
     */
    return this.forceUpdate();
  });

  componentDidMount() {
    window.addEventListener('resize', this.forceRefresh as any);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.forceRefresh as any);
  }

  render() {
    const { numOfPages, currentPage, classes, ...rest } = this.props;
    return (
      <React.Fragment>
        {/** display "1 ... " if we're on a page higher than 5 */
        currentPage >= 5 ? (
          <React.Fragment>
            <PageNumber
              number={1}
              data-qa-page-to={1}
              disabled={currentPage === 1}
              aria-label={`Page 1`}
              {...rest}
            >
              1
            </PageNumber>
            <div className={classes.ellipses}>
              <span className={classes.ellipsesInner}>...</span>
            </div>
          </React.Fragment>
        ) : null}
        {pageNumbersToRender(currentPage, numOfPages).map(eachPage => (
          <PageNumber
            number={eachPage}
            data-qa-page-to={eachPage}
            key={eachPage}
            disabled={eachPage === currentPage}
            aria-label={`Page ${eachPage}`}
            {...rest}
          >
            {eachPage}
          </PageNumber>
        ))}
        {/* if we have more than 5 pages and we're on a page that is
        not one of the last 5 pages, show " ... lastPage# " */
        numOfPages > 5 && currentPage <= numOfPages - 4 ? (
          <React.Fragment>
            <div className={classes.ellipses}>
              <span className={classes.ellipsesInner}>...</span>
            </div>
            <PageNumber
              number={numOfPages}
              data-qa-page-to={numOfPages}
              disabled={currentPage === numOfPages}
              aria-label={`Page ${numOfPages}`}
              {...rest}
            >
              {numOfPages}
            </PageNumber>
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  }
}

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
      </PageButton>
    );
  }
}

/**
 *
 * @param { number } currentPage - current page we're on
 * @param { number } numOfPages - total number of pages returned from the API
 *
 * This function is determining what page numbers to show in the pagination footer.
 * It will either return pages 1 - 5, 5 pages in the middle, or the last 5 pages depending
 * on what the current page is
 */
export const pageNumbersToRender = (
  currentPage: number,
  numOfPages: number
) => {
  /** creates an array of numbers, starting at 1, created from the numOfPages returned from API */
  const arrOfPageNumbers = Array.from(Array(numOfPages).keys()).map(
    (value, index) => index + 1
  );
  /** return first 5 pages if we on a page under 5 */
  if (currentPage < 5) {
    return take(5, arrOfPageNumbers);
    /** return 2 pages below and 2 pages above current page  */
  } else if (currentPage >= 5 && currentPage <= numOfPages - 4) {
    /** basically, if we're on small window size, show less buttons in the pagination footer */
    const indexStart = windowIsNarrowerThan(700) ? 2 : 3;
    const indexEnd = windowIsNarrowerThan(700) ? 1 : 2;
    return arrOfPageNumbers.slice(
      currentPage - indexStart,
      currentPage + indexEnd
    );
  }

  /** otherwise just return the last 5 pages */
  return arrOfPageNumbers.slice(numOfPages - 5);
};
