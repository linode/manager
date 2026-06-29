import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { ERROR_STATE_TEXT, ERROR_STATE_TITLE } from '../constants';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders with default error text', async () => {
    renderWithProviders(<ErrorState />);
    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('renders with custom error text', async () => {
    const customErrorText = 'Custom error message';
    renderWithProviders(<ErrorState errorText={customErrorText} />);
    expect(screen.getByText(customErrorText)).toBeVisible();
  });
});
