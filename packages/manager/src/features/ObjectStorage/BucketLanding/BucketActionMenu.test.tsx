import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { BucketActionMenu } from './BucketActionMenu';

jest.mock('src/components/ActionMenu/ActionMenu');

const mockOnRemove = jest.fn();

const props = {
  onRemove: mockOnRemove
};

afterAll(cleanup);

describe('BucketActionMenu', () => {
  it('Includes a "Delete" option', () => {
    const { queryByText } = render(
      wrapWithTheme(<BucketActionMenu {...props} />)
    );
    expect(queryByText('Delete')).toBeInTheDocument();
  });

  it('executes the onRemove function when the "Delete" option is clicked', () => {
    const { getAllByText } = render(
      wrapWithTheme(<BucketActionMenu {...props} />)
    );

    fireEvent.click(getAllByText('Delete')[0]);
    expect(mockOnRemove).toHaveBeenCalled();
  });
});
