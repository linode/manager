import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { KeyTypeBadge } from './KeyTypeBadge';

describe('KeyTypeBadge', () => {
  it('renders user key badge', () => {
    const { getByText } = renderWithTheme(<KeyTypeBadge keyType="user" />);
    expect(getByText('User Key')).toBeVisible();
  });

  it('renders playground key badge', () => {
    const { getByText } = renderWithTheme(
      <KeyTypeBadge keyType="playground" />
    );
    expect(getByText('Playground Key')).toBeVisible();
  });

  it('renders as a Chip component', () => {
    const { container } = renderWithTheme(<KeyTypeBadge keyType="user" />);
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });
});
