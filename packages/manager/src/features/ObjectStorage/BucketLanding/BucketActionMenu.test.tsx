import { vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { BucketActionMenu } from './BucketActionMenu';

window.matchMedia = vi.fn().mockImplementation((query) => {
  return {
    matches: true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
});

const mockOnRemove = vi.fn();

const props = {
  onRemove: mockOnRemove,
  onDetails: vi.fn(),
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
