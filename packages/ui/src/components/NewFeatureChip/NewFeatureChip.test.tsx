import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { NewFeatureChip } from './NewFeatureChip';

describe('NewFeatureChip', () => {
  it('renders with default color (primary)', () => {
    const { getByTestId } = renderWithTheme(<NewFeatureChip />);
    const newFeatureChip = getByTestId('newFeatureChip');
    expect(newFeatureChip).toBeInTheDocument();
    expect(newFeatureChip).toHaveStyle('background-color: rgba(0, 0, 0, 0.08)');
  });

  it('renders with primary color', () => {
    const { getByTestId } = renderWithTheme(
      <NewFeatureChip color="secondary" />
    );
    const newFeatureChip = getByTestId('newFeatureChip');
    expect(newFeatureChip).toBeInTheDocument();
    expect(newFeatureChip).toHaveStyle('background-color: rgb(131, 131, 140)');
  });

  it('triggers an onClick callback', () => {
    const onClickMock = vi.fn();
    const { getByTestId } = renderWithTheme(
      <NewFeatureChip color="primary" onClick={onClickMock} />
    );
    const newFeatureChip = getByTestId('newFeatureChip');
    fireEvent.click(newFeatureChip);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
