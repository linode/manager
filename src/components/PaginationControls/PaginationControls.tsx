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

export interface PageObject {
  disabled: boolean;
  number: number;
}

interface State {
  pages: PageObject[];
};

const calPages = (count: number, pageSize: number) => Math.ceil(count / pageSize);

const createPagesArray = (count: number, pageSize: number) => Array.from(Array(calPages(count, pageSize)));

const createPageObject = (handler: (n: number) => void, page: number) => (v: void, idx: number) => {
  const number = idx + 1;
  return ({
    disabled: page === number,
    number,
  });
};

const createPages = (
  count: number,
  onClickHandler: (n: number) => void,
  page: number,
  pageSize: number,
) => createPagesArray(count, pageSize).map(createPageObject(onClickHandler, page));

export class PaginationControls extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { count, pageSize, onClickHandler, page } = props;

    this.state = {
      pages: createPages(count, onClickHandler, page, pageSize),
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.count === this.props.count
      && prevProps.page === this.props.page
      && prevProps.pageSize === this.props.pageSize
    ) {
      return;
    }

    const { count, onClickHandler, page, pageSize } = this.props;

    this.setState({
      pages: createPages(count, onClickHandler, page, pageSize),
    });
  }

  handleSendEvent = (eventLabel: string) => {
    const { eventCategory } = this.props;

    if (!eventCategory) return;

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
    const numPages = Math.ceil(count / pageSize);
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
          pages={this.state.pages}
          numOfPages={numPages}
          handlePageClick={this.handlePageClick}
          page={page}
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
