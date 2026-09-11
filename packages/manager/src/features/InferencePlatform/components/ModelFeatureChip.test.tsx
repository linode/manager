import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ModelFeatureChip } from './ModelFeatureChip';

describe('ModelFeatureChip', () => {
  it('renders the label', () => {
    const { getByText } = renderWithTheme(
      <ModelFeatureChip label="Coding" type="useCaseTags" />
    );
    expect(getByText('Coding')).toBeVisible();
  });

  it('calls onClick when clicked in toggle mode', () => {
    const onClick = vi.fn();
    const { getByText } = renderWithTheme(
      <ModelFeatureChip
        active
        label="Coding"
        onClick={onClick}
        type="useCaseTags"
      />
    );

    getByText('Coding').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a delete affordance when onDelete is provided', () => {
    const { container } = renderWithTheme(
      <ModelFeatureChip label="Search: foo" onDelete={vi.fn()} type="search" />
    );
    expect(container.querySelector('.MuiChip-deleteIcon')).toBeInTheDocument();
  });

  it('uses different classes for active vs inactive toggle chips', () => {
    const active = renderWithTheme(
      <ModelFeatureChip active label="X" onClick={vi.fn()} type="provider" />
    );
    const inactive = renderWithTheme(
      <ModelFeatureChip label="X" onClick={vi.fn()} type="provider" />
    );

    const activeChip = active.container.querySelector('.MuiChip-root');
    const inactiveChip = inactive.container.querySelector('.MuiChip-root');

    expect(activeChip?.className).not.toEqual(inactiveChip?.className);
  });
});
