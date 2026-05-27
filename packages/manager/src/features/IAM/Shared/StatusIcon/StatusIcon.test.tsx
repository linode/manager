import { Color } from '@akamai/cds-tokens';
import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { StatusIcon } from './StatusIcon';

describe('IAM StatusIcon', () => {
  it.each([
    ['active', Color.Green[70]],
    ['error', Color.Red[70]],
    ['inactive', Color.Neutrals[30]],
    ['other', Color.Amber[70]],
  ] as const)('renders the correct color for %s status', (status, color) => {
    renderWithTheme(<StatusIcon status={status} />);

    expect(screen.getByLabelText(`Status is ${status}`)).toHaveStyle({
      backgroundColor: color,
    });
  });

  it('renders a default aria label from the status', () => {
    renderWithTheme(<StatusIcon status="active" />);

    expect(screen.getByLabelText('Status is active')).toBeVisible();
  });

  it('renders a custom aria label when provided', () => {
    renderWithTheme(
      <StatusIcon ariaLabel="Last login failed" status="error" />
    );

    expect(screen.getByLabelText('Last login failed')).toBeVisible();
    expect(screen.queryByLabelText('Status is error')).not.toBeInTheDocument();
  });

  it('defaults to the pulse animation for the "other" status', () => {
    renderWithTheme(<StatusIcon status="other" />);

    expect(screen.getByLabelText('Status is other')).toHaveStyle({
      animation: 'pulse 1.5s ease-in-out infinite',
    });
  });

  it('does not pulse for the "active" status by default', () => {
    renderWithTheme(<StatusIcon status="active" />);

    expect(screen.getByLabelText('Status is active').style.animation).toBe('');
  });

  it('respects explicit pulse and style props', () => {
    renderWithTheme(
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
    expect(icon).toHaveStyle({ backgroundColor: Color.Red[70] });
  });
});
