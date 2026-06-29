import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders an hr element', () => {
    renderWithProviders(<Divider />);
    screen.getByRole('separator');
  });

  it('applies spacingTop and spacingBottom styles', () => {
    renderWithProviders(<Divider spacingBottom="16px" spacingTop="8px" />);
    const hr = screen.getByRole('separator');
    expect(hr).toHaveStyle({ marginTop: '8px', marginBottom: '16px' });
  });
});
