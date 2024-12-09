import '@testing-library/jest-dom/vitest';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { BetaChip } from './BetaChip';

describe('BetaChip', () => {
  it('renders with default color', () => {
    const { getByTestId } = render(<BetaChip />);
    const betaChip = getByTestId('betaChip');
    expect(betaChip).toBeInTheDocument();
    expect(betaChip).toHaveStyle('background-color: rgba(0, 0, 0, 0.08)');
  });

  it('renders with primary color', () => {
    const { getByTestId } = render(<BetaChip color="primary" />);
    const betaChip = getByTestId('betaChip');
    expect(betaChip).toBeInTheDocument();
    expect(betaChip).toHaveStyle('background-color: rgb(25, 118, 210)');
  });

  it('triggers an onClick callback', () => {
    const onClickMock = vi.fn();
    const { getByTestId } = render(
      <BetaChip color="default" onClick={onClickMock} />
    );
    const betaChip = getByTestId('betaChip');
    fireEvent.click(betaChip);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
