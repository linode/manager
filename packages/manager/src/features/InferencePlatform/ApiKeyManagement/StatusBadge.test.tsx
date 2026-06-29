import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders active status', () => {
    const { getByText } = renderWithTheme(<StatusBadge status="active" />);
    expect(getByText('active')).toBeVisible();
  });

  it('renders expired status', () => {
    const { getByText } = renderWithTheme(<StatusBadge status="expired" />);
    expect(getByText('expired')).toBeVisible();
  });

  it('renders revoked status', () => {
    const { getByText } = renderWithTheme(<StatusBadge status="revoked" />);
    expect(getByText('revoked')).toBeVisible();
  });

  it('renders as a Chip component', () => {
    const { container } = renderWithTheme(<StatusBadge status="active" />);
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });
});
