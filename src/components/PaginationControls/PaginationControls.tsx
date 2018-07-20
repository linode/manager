import * as React from 'react';

import FirstPage from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPage from '@material-ui/icons/LastPage';

import PageButton from 'src/components/PaginationControls/PageButton';

interface Props {
  count: number;
  page: number;
  pageSize: number;
  onClickHandler: (page?: number) => void;
}

interface PageObject {
  onClick: () => void;
  disabled: boolean;
  number: number;
}

interface State {
  pages: PageObject[];
};

export class PaginationControls extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { count, pageSize } = props;

    this.state = {
      pages: Array.from(Array(Math.ceil(count / pageSize))).map((v, idx) => {
        const number = idx + 1;

        return ({
          onClick: () => this.props.onClickHandler(number),
          disabled: this.props.page === number,
          number,
        });
      }),
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

    this.setState({
      pages: Array.from(Array(Math.ceil(this.props.count / this.props.pageSize))).map((v, idx) => {
        const number = idx + 1;

        return ({
          onClick: () => this.props.onClickHandler(number),
          disabled: this.props.page === number,
          number,
        });
      }),
    });
  }

  handleFirstPageClick = () => {
    this.props.onClickHandler(1);
  };

  handleNextPageClick = () => {
    this.props.onClickHandler(this.props.page + 1)
  }

  handlePreviousPageClick = () => {
    this.props.onClickHandler(this.props.page - 1)
  }

  handleLastPageClick = () => {
    this.props.onClickHandler(
      Math.max(0, Math.ceil(this.props.count / this.props.pageSize)),
    );
  };

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
        {
          this.state.pages.map((page) => (
            <PageButton data-qa-page-to={page.number} key={page.number} onClick={page.onClick} disabled={page.disabled} aria-label="Next Page" >
              {page.number}
            </PageButton>
          ))
        }
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
