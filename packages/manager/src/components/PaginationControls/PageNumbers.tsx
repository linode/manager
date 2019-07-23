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

export type CombinedProps = Props & StyleProps;

// This component handles page numbering for the pagination footer.
// The first and last page are always shown, and depending on the number
// of pages (and the selected page number), ellipses may be shown.
//
// Examples: ("*" denotes selected page)
// 1 2 *3* 4 5 6
// 1 2 3 *4* 5 ... 7
// 1 ... 3 4 *5* 6 7
// 1 ... 5 6 *7* 8 9 ... 11
//
// On smaller viewports, only 3 page numbers are shown in the middle,
// so the last example becomes 1 ... 6 *7* 8 ... 11
export class PageNumbers extends React.PureComponent<CombinedProps> {
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

    const pageNumbers = pageNumbersToRender(currentPage, numOfPages);

    return (
      <React.Fragment>
        {/* We always want to start with "1", so if it isn't already the first
        element in pageNumbers, add it here. */}
        {pageNumbers[0] !== 1 && (
          <React.Fragment>
            <PageNumber
              number={1}
              data-qa-page-to={1}
              data-testid={1}
              disabled={currentPage === 1}
              aria-label={`Page 1`}
              {...rest}
            >
              1
            </PageNumber>
            {/* We want an ellipsis here, unless the first element of pageNumbers is 2, because
             "1 ... 2" is incorrect. */}
            {pageNumbers[0] !== 2 && (
              <div data-testid="leading-ellipsis" className={classes.ellipses}>
                <span className={classes.ellipsesInner}>...</span>
              </div>
            )}
          </React.Fragment>
        )}
        {pageNumbers.map(eachPage => (
          <PageNumber
            number={eachPage}
            data-qa-page-to={eachPage}
            data-testid={eachPage}
            key={eachPage}
            disabled={eachPage === currentPage}
            aria-label={`Page ${eachPage}`}
            {...rest}
          >
            {eachPage}
          </PageNumber>
        ))}
        {/* We always want to end with the last page, so if it isn't already the last
        element in pageNumbers, add it here. */}
        {pageNumbers[pageNumbers.length - 1] !== numOfPages && (
          <React.Fragment>
            {/* We want an ellipsis here, unless the last element of pageNumbers is equal to
            numPages-1, because "6 ... 7" is incorrect. */}
            {pageNumbers[pageNumbers.length - 1] !== numOfPages - 1 && (
              <div data-testid="trailing-ellipsis" className={classes.ellipses}>
                <span className={classes.ellipsesInner}>...</span>
              </div>
            )}
            <PageNumber
              number={numOfPages}
              data-qa-page-to={numOfPages}
              data-testid={numOfPages}
              disabled={currentPage === numOfPages}
              aria-label={`Page ${numOfPages}`}
              {...rest}
            >
              {numOfPages}
            </PageNumber>
          </React.Fragment>
        )}
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
