import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { mockMatchMedia, wrapWithTheme } from 'src/utilities/testHelpers';

import { BucketActionMenu } from './BucketActionMenu';

const mockOnRemove = vi.fn();

const props = {
  cluster: '',
  label: '',
  onDetails: vi.fn(),
  onRemove: mockOnRemove,
};

describe('BucketActionMenu', () => {
  it('includes a "Delete" option', () => {
    mockMatchMedia();
    const { getByText } = render(
      wrapWithTheme(<BucketActionMenu {...props} />)
    );
    getByText('Delete');
  });

  it('executes the onRemove function when the "Delete" option is clicked', () => {
    mockMatchMedia();
    const { getByText } = render(
      wrapWithTheme(<BucketActionMenu {...props} />)
    );
    fireEvent.click(getByText('Delete'));
    expect(mockOnRemove).toHaveBeenCalled();
  });
});
