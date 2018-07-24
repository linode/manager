import * as React from 'react';

import FirstPage from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPage from '@material-ui/icons/LastPage';

import PageButton, { Props as PageButtonProps } from 'src/components/PaginationControls/PageButton';

interface Props {
  count: number;
  page: number;
  pageSize: number;
  onClickHandler: (page?: number) => void;
}

interface PageObject {
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

  handlePageClick = (page: number) => {
    this.props.onClickHandler(page);
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
        {
          this.state.pages.map(({ number, disabled}) => (
            <PageNumber
              number={number}
              handlePageClick={this.handlePageClick}
              data-qa-page-to={number}
              key={number}
              disabled={disabled}
              arial-label={`Page ${number}`}
            >
              {number}
            </PageNumber>
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


interface PageNumberProps extends PageButtonProps {
  number: number;
  handlePageClick: (n: number) => void;
}

class PageNumber extends React.PureComponent<PageNumberProps> {
  onClick = () => this.props.handlePageClick(this.props.number);

  render() {
    const { onClick, children, handlePageClick, ...rest} = this.props;

    return (
      <PageButton {...rest} onClick={this.onClick}>
        {children}
      </PageButton>);
  }
};
