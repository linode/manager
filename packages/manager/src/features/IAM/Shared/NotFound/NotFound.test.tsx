import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('renders with default error text', async () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('Not Found')).toBeVisible();
    expect(screen.getByText('This page does not exist.')).toBeVisible();
  });
});
