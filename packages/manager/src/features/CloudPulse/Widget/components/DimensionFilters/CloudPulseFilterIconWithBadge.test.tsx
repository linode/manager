import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDimensionFilterIconWithBadge } from './CloudPulseFilterIconWithBadge';

describe('CloudPulseDimensionFilterIconWithBadge', () => {
  it('renders the badge with correct count when count > 0', () => {
    renderWithTheme(<CloudPulseDimensionFilterIconWithBadge count={5} />);

    // Badge content should be visible
    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
  });

  it('does not render the badge when count = 0', () => {
    renderWithTheme(<CloudPulseDimensionFilterIconWithBadge count={0} />);

    // Badge should not be visible
    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });
});
