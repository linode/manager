import * as React from 'react';

import FirstPage from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPage from '@material-ui/icons/LastPage';

import PageButton from 'src/components/PaginationControls/PageButton';
import { sendEvent } from 'src/utilities/analytics';

import PageNumbers from './PageNumbers';

interface Props {
  count: number;
  page: number;
  pageSize: number;
  eventCategory?: string;
  onClickHandler: (page?: number) => void;
}

export class PaginationControls extends React.Component<Props, {}> {
  handleSendEvent = (eventLabel: string) => {
    const { eventCategory } = this.props;

    if (!eventCategory) { return };

    sendEvent({
      category: eventCategory,
      action: 'pagination',
      label: eventLabel
    });
  }

  handleFirstPageClick = () => {
    const { onClickHandler } = this.props;

    onClickHandler(1);
    this.handleSendEvent('first');
  };

  handleNextPageClick = () => {
    const { onClickHandler, page } = this.props;

    onClickHandler(page + 1);
    this.handleSendEvent('next');
  }

  handlePreviousPageClick = () => {
    const { onClickHandler, page } = this.props;

    onClickHandler(page - 1);
    this.handleSendEvent('previous');
  }

  handleLastPageClick = () => {
    const { onClickHandler, count, pageSize } = this.props;

    onClickHandler(
      Math.max(0, Math.ceil(count / pageSize)),
    );
    this.handleSendEvent('last');
  };

  handlePageClick = (page: number) => {
    const { onClickHandler } = this.props;

    onClickHandler(page);
    this.handleSendEvent('page number');
  }

  render() {
    /** API paging starts at 1. Don't they know arrays starts at 0? */
    const { count, page, pageSize, } = this.props;
    const numPages = calNumOfPages(count, pageSize);
    const disableHead = page === 1;
    const disableTail = page >= numPages;

    return (
      <div>
        <PageButton data-qa-page-first onClick={this.handleFirstPageClick} disabled={disableHead} aria-label="First Page" >
          <FirstPage />
        </PageButton>

        <PageButton data-qa-page-previous onClick={this.handlePreviousPageClick} disabled={disableHead} aria-label="Previous Page" >
          <KeyboardArrowLeft />
        </PageButton>
        <PageNumbers
          numOfPages={calNumOfPages(count, pageSize)}
          handlePageClick={this.handlePageClick}
          currentPage={page}
        />
        <PageButton data-qa-page-next onClick={this.handleNextPageClick} disabled={disableTail} aria-label="Next Page" >
          <KeyboardArrowRight />
        </PageButton>

        <PageButton data-qa-page-last onClick={this.handleLastPageClick} disabled={disableTail} aria-label="Last Page" >
          <LastPage />
        </PageButton>
      </div >
    );
  }

};

export default PaginationControls;

/**
 * 
 * @param { number } count - the amount of total things returned from the API
 * @param { number } pageSize - the selected page size filter returned from the API
 * 
 * @todo remove this function altogether. This information is returned from the API
 * and can be passed down as props making this function unnecessary
 */
const calNumOfPages = (count: number, pageSize: number) => Math.ceil(count / pageSize);
