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
  it('Includes a "Remove" option', () => {
    const { queryByText } = render(
      wrapWithTheme(<BucketActionMenu {...props} />)
    );
    expect(queryByText('Remove')).toBeInTheDocument();
  });

  it('executes the onRemove function when the "Remove" option is clicked', () => {
    const { getByText } = render(
      wrapWithTheme(<BucketActionMenu {...props} />)
    );

    fireEvent.click(getByText('Remove'));
    expect(mockOnRemove).toHaveBeenCalledWith('a-cluster', 'my-test-bucket');
  });
});
