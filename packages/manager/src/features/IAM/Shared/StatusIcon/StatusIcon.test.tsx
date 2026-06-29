import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { STATUS_COLORS } from './constants';
import { StatusIcon } from './StatusIcon';

describe('IAM StatusIcon', () => {
  it.each([
    ['active', STATUS_COLORS.active],
    ['error', STATUS_COLORS.error],
    ['inactive', STATUS_COLORS.inactive],
    ['other', STATUS_COLORS.other],
  ] as const)('renders the correct color for %s status', (status, color) => {
    renderWithProviders(<StatusIcon status={status} />);

    expect(screen.getByLabelText(`Status is ${status}`)).toHaveStyle({
      backgroundColor: color,
    });
  });

  it('renders a default aria label from the status', () => {
    renderWithProviders(<StatusIcon status="active" />);

    expect(screen.getByLabelText('Status is active')).toBeVisible();
  });

  it('renders a custom aria label when provided', () => {
    renderWithProviders(
      <StatusIcon ariaLabel="Last login failed" status="error" />
    );

    expect(screen.getByLabelText('Last login failed')).toBeVisible();
    expect(screen.queryByLabelText('Status is error')).not.toBeInTheDocument();
  });

  it('defaults to the pulse animation for the "other" status', () => {
    renderWithProviders(<StatusIcon status="other" />);

    expect(screen.getByLabelText('Status is other')).toHaveStyle({
      animation: 'pulse 1.5s ease-in-out infinite',
    });
  });

  it('does not pulse for the "active" status by default', () => {
    renderWithProviders(<StatusIcon status="active" />);

    expect(screen.getByLabelText('Status is active').style.animation).toBe('');
  });

  it('respects explicit pulse and style props', () => {
    renderWithProviders(
      <StatusIcon
        data-testid="status-icon"
        pulse={false}
        status="error"
        style={{ alignSelf: 'center', marginRight: 0 }}
      />
    );

    const icon = screen.getByTestId('status-icon');

    expect(icon.style.animation).toBe('');
    expect(icon.style.alignSelf).toBe('center');
    expect(icon.style.marginRight).toBe('0px');
    expect(icon).toHaveStyle({ backgroundColor: STATUS_COLORS.error });
  });
});
