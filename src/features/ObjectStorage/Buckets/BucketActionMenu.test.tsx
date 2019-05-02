import * as React from 'react';
import { cleanup, fireEvent, render } from 'react-testing-library';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { BucketActionMenu } from './BucketActionMenu';

jest.mock('src/components/ActionMenu/ActionMenu');

const mockOnRemove = jest.fn();

const props = {
  onRemove: mockOnRemove,
  bucketLabel: 'my-test-bucket',
  cluster: 'a-cluster'
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
    expect(mockOnRemove).toHaveBeenCalledWith('a-cluster', 'my-test-bucket');
  });
});
