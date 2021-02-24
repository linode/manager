import { screen } from '@testing-library/react';
import * as React from 'react';
import PaginationControls, { Props } from './PaginationControls';
import { renderWithTheme } from 'src/utilities/testHelpers';

const props: Props = {
  count: 100,
  page: 1,
  pageSize: 25,
  eventCategory: 'a-category',
  onClickHandler: jest.fn(),
  classes: {},
};

describe('PaginationControls', () => {
  it('should have a previous page button.', () => {
    renderWithTheme(<PaginationControls {...props} />);
    expect(screen.getByTestId('previous-page')).toBeInTheDocument();
  });

  it('should have a next page button.', () => {
    renderWithTheme(<PaginationControls {...props} />);
    expect(screen.getByTestId('next-page')).toBeInTheDocument();
  });

  it('previous page button should be disabled when on first page', () => {
    renderWithTheme(<PaginationControls {...props} />);
    expect(screen.getByTestId('previous-page')).toBeDisabled();
  });

  it('next page button should be disabled when on last page', () => {
    renderWithTheme(<PaginationControls {...props} page={4} />);
    expect(screen.getByTestId('next-page')).toBeDisabled();
  });

  it('should render a button for each page', () => {
    renderWithTheme(<PaginationControls {...props} />);

    expect(screen.getByTestId('1')).toBeInTheDocument();
    expect(screen.getByTestId('2')).toBeInTheDocument();
    expect(screen.getByTestId('3')).toBeInTheDocument();
    expect(screen.getByTestId('4')).toBeInTheDocument();
  });

  it('should render a disabled button for the current page', () => {
    renderWithTheme(<PaginationControls {...props} page={2} />);
    expect(screen.getByTestId('2')).toBeDisabled();
  });
});
