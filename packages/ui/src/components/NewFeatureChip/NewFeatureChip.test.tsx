import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { NewFeatureChip } from './NewFeatureChip';

describe('NewFeatureChip', () => {
  it('renders with default color', () => {
    const { getByTestId } = renderWithTheme(<NewFeatureChip />);
    const newFeatureChip = getByTestId('newFeatureChip');
    expect(newFeatureChip).toBeInTheDocument();
    expect(newFeatureChip).toHaveStyle('background-color: rgb(114, 89, 214)');
  });

  it('triggers an onClick callback', () => {
    const onClickMock = vi.fn();
    const { getByTestId } = renderWithTheme(
      <NewFeatureChip onClick={onClickMock} />,
    );
    const newFeatureChip = getByTestId('newFeatureChip');
    fireEvent.click(newFeatureChip);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
