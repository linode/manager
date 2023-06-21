import { vi } from 'vitest';
import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { screen } from '@testing-library/react';
import { ShowMore } from 'src/components/ShowMore/ShowMore';

const mockRender = vi.fn();

const props = {
  ariaItemType: 'items',
  items: ['a', 'b'],
  render: mockRender,
};

describe('ShowMore', () => {
  beforeEach(() => {
    renderWithTheme(<ShowMore {...props} />);
  });

  it('should call provided render function with items.', () => {
    expect(mockRender).toHaveBeenCalledWith(['a', 'b']);
  });

  it('should render a chip with items.length', () => {
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
