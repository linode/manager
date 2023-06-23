import * as React from 'react';
import { PaginationControls } from './PaginationControls';
import { renderWithTheme } from 'src/utilities/testHelpers';

const props = {
  count: 100,
  onClickHandler: jest.fn(),
  page: 1,
  pageSize: 25,
};

describe('PaginationControls', () => {
  it('should render a button for each page', () => {
    const { getByText } = renderWithTheme(<PaginationControls {...props} />);

    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
    expect(getByText('3')).toBeInTheDocument();
    expect(getByText('4')).toBeInTheDocument();
  });
});
