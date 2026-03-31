import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Divider } from './Divider';

describe('Divider', () => {
  it('renders an hr element', () => {
    renderWithTheme(<Divider />);
    screen.getByRole('separator');
  });

  it('applies spacingTop and spacingBottom styles', () => {
    renderWithTheme(<Divider spacingBottom="16px" spacingTop="8px" />);
    const hr = screen.getByRole('separator');
    expect(hr).toHaveStyle({ marginTop: '8px', marginBottom: '16px' });
  });
});
