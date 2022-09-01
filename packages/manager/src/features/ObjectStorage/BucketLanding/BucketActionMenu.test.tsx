import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { BucketActionMenu } from './BucketActionMenu';

window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
});

const mockOnRemove = jest.fn();

const props = {
  onRemove: mockOnRemove,
  onDetails: jest.fn(),
  label: '',
  cluster: '',
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
