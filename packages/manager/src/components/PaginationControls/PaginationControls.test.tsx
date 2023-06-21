import { vi } from 'vitest';
import * as React from 'react';
import { PaginationControls } from './PaginationControls';
import { renderWithTheme } from 'src/utilities/testHelpers';

const props = {
  count: 100,
  page: 1,
  pageSize: 25,
  onClickHandler: vi.fn(),
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
