import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import PageButton from 'src/components/PaginationControls/PageButton';
import { sendPaginationEvent } from 'src/utilities/ga';
import PageNumbers from './PageNumbers';

type CSSClasses = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      '& [aria-label="Previous Page"]:disabled': {
        backgroundColor: theme.bg.bgPaper,
        color: theme.textColors.tableHeader,
      },
      '& [aria-label="Next Page"]:disabled': {
        backgroundColor: theme.bg.bgPaper,
        color: theme.textColors.tableHeader,
      },
    },
  });

const styled = withStyles(styles);

export interface Props {
  count: number;
  page: number;
  pageSize: number;
  eventCategory?: string;
  onClickHandler: (page?: number) => void;
  classes: any;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

export class PaginationControls extends React.Component<CombinedProps, {}> {
  handleSendEvent = (eventLabel: string) => {
    const { eventCategory } = this.props;

    if (!eventCategory) {
      return;
    }

    sendPaginationEvent(eventCategory, eventLabel);
  };

  handleFirstPageClick = () => {
    const { onClickHandler } = this.props;

    onClickHandler(1);
    this.handleSendEvent('first');
  };

  handleNextPageClick = () => {
    const { onClickHandler, page } = this.props;

    onClickHandler(page + 1);
    this.handleSendEvent('next');
  };

  handlePreviousPageClick = () => {
    const { onClickHandler, page } = this.props;

    onClickHandler(page - 1);
    this.handleSendEvent('previous');
  };

  handleLastPageClick = () => {
    const { onClickHandler, count, pageSize } = this.props;

    onClickHandler(Math.max(0, Math.ceil(count / pageSize)));
    this.handleSendEvent('last');
  };

  handlePageClick = (page: number) => {
    const { onClickHandler } = this.props;

    onClickHandler(page);
    this.handleSendEvent('page number');
  };

  render() {
    /** API paging starts at 1. Don't they know arrays starts at 0? */
    const { count, page, pageSize, classes } = this.props;
    const numPages = calNumOfPages(count, pageSize);
    const disableHead = page === 1;
    const disableTail = page >= numPages;

    return (
      <div className={classes.root}>
        <PageButton
          disabled={disableHead}
          onClick={this.handlePreviousPageClick}
          aria-label="Previous Page"
          data-qa-page-previous
          data-testid="previous-page"
        >
          <KeyboardArrowLeft />
        </PageButton>
        <PageNumbers
          currentPage={page}
          handlePageClick={this.handlePageClick}
          numOfPages={calNumOfPages(count, pageSize)}
        />
        <PageButton
          disabled={disableTail}
          onClick={this.handleNextPageClick}
          aria-label="Next Page"
          data-qa-page-next
          data-testid="next-page"
        >
          <KeyboardArrowRight />
        </PageButton>
      </div>
    );
  }
}

export default styled(PaginationControls);

/**
 *
 * @param { number } count - the amount of total things returned from the API
 * @param { number } pageSize - the selected page size filter returned from the API
 *
 * @todo remove this function altogether. This information is returned from the API
 * and can be passed down as props making this function unnecessary
 */
const calNumOfPages = (count: number, pageSize: number) =>
  Math.ceil(count / pageSize);
