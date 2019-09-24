import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { ObjectActionMenu } from './ObjectActionMenu';

jest.mock('src/components/ActionMenu/ActionMenu');

const mockOnRemove = jest.fn();

const props = {
  handleClickDelete: mockOnRemove
};

afterAll(cleanup);

describe('ObjectActionMenu', () => {
  it('Includes a "Delete" option', () => {
    const { queryByText } = render(
      wrapWithTheme(<ObjectActionMenu {...props} />)
    );
    expect(queryByText('Delete')).toBeInTheDocument();
  });

  it('executes the onRemove function when the "Delete" option is clicked', () => {
    const { getAllByText } = render(
      wrapWithTheme(<ObjectActionMenu {...props} />)
    );

    fireEvent.click(getAllByText('Delete')[0]);
    expect(mockOnRemove).toHaveBeenCalled();
  });
});
