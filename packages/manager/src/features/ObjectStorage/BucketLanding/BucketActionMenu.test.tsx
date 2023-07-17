import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { BucketActionMenu } from './BucketActionMenu';

window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    addListener: jest.fn(),
    matches: true,
    media: query,
    onchange: null,
    removeListener: jest.fn(),
  };
});

const mockOnRemove = jest.fn();

const props = {
  cluster: '',
  label: '',
  onDetails: jest.fn(),
  onRemove: mockOnRemove,
};

describe('BucketActionMenu', () => {
  it('includes a "Delete" option', () => {
    const { getByText } = render(
      wrapWithTheme(<BucketActionMenu {...props} />)
    );
    getByText('Delete');
  });

  it('executes the onRemove function when the "Delete" option is clicked', () => {
    const { getByText } = render(
      wrapWithTheme(<BucketActionMenu {...props} />)
    );
    fireEvent.click(getByText('Delete'));
    expect(mockOnRemove).toHaveBeenCalled();
  });
});
