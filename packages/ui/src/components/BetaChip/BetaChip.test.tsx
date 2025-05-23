import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { BetaChip } from './BetaChip';

describe('BetaChip', () => {
  it('renders with default color', () => {
    const { getByTestId } = renderWithTheme(<BetaChip />);
    const betaChip = getByTestId('betaChip');
    expect(betaChip).toBeInTheDocument();
    expect(betaChip).toHaveStyle('background-color: rgb(105, 105, 112)');
  });

  it('triggers an onClick callback', () => {
    const onClickMock = vi.fn();
    const { getByTestId } = renderWithTheme(<BetaChip onClick={onClickMock} />);
    const betaChip = getByTestId('betaChip');
    fireEvent.click(betaChip);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
