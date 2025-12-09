import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ClearIconButton } from './ClearIconButton';

describe('Clear Icon Button', () => {
  it('should render the icon', () => {
    const { getByTestId } = renderWithTheme(
      <ClearIconButton handleClick={vi.fn()} />
    );
    expect(getByTestId('clear-icon')).toBeInTheDocument();
    expect(getByTestId('ClearOutlinedIcon')).toBeInTheDocument();
  });
});
