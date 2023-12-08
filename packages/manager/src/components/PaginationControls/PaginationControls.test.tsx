import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PaginationControls } from './PaginationControls';

const props = {
  count: 100,
  onClickHandler: vi.fn(),
  page: 1,
  pageSize: 25,
};

describe('PaginationControls', () => {
  it('should render a button for each page and call the button handler when clicked', () => {
    const { getByText } = renderWithTheme(<PaginationControls {...props} />);

    const p1 = getByText('1');
    expect(p1).toBeInTheDocument();
    fireEvent.click(p1);
    expect(props.onClickHandler).toHaveBeenCalledTimes(1);

    const p2 = getByText('2');
    expect(p2).toBeInTheDocument();
    fireEvent.click(p2);
    expect(props.onClickHandler).toHaveBeenCalledTimes(2);

    const p3 = getByText('3');
    expect(p3).toBeInTheDocument();
    fireEvent.click(p3);
    expect(props.onClickHandler).toHaveBeenCalledTimes(3);

    const p4 = getByText('4');
    expect(p4).toBeInTheDocument();
    fireEvent.click(p4);
    expect(props.onClickHandler).toHaveBeenCalledTimes(4);
  });
});
