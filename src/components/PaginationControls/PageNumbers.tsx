import { take } from 'ramda';
import * as React from 'react';
import withStyles, { StyleProps } from './PageNumbers.styles';

import PageButton, { Props as PageButtonProps } from 'src/components/PaginationControls/PageButton';

import { PageObject } from './PaginationControls';

interface Props {
  page: number
  numOfPages: number;
  pages: PageObject[]
  handlePageClick: (n: number) => void
}

const PageNumbers: React.StatelessComponent<Props & StyleProps> = (props) => {
  const { numOfPages, pages, page, classes, ...rest } = props;

  return (
    <React.Fragment>
      {
        take(5, pages).map(({ number, disabled }) => (
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
        (numOfPages > 5)
          ? <React.Fragment>
            <span className={classes.ellipses}>...</span>
            <PageNumber
              number={pages.length}
              data-qa-page-to={pages.length}
              disabled={page === pages.length}
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
