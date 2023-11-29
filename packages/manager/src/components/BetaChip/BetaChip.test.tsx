import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BetaChip } from './BetaChip';

describe('BetaChip', () => {
  it('renders with default color', () => {
    const { getByTestId } = renderWithTheme(<BetaChip />);
    const betaChip = getByTestId('betaChip');
    expect(betaChip).toBeInTheDocument();
    expect(betaChip).toHaveStyle('background-color: rgba(0, 0, 0, 0.08)');
  });

  it('renders with primary color', () => {
    const { getByTestId } = renderWithTheme(<BetaChip color="primary" />);
    const betaChip = getByTestId('betaChip');
    expect(betaChip).toBeInTheDocument();
    expect(betaChip).toHaveStyle('background-color: #3683dc');
  });

  it('triggers an onClick callback', () => {
    const onClickMock = vi.fn();
    const { getByTestId } = renderWithTheme(
      <BetaChip color="default" onClick={onClickMock} />
    );
    const betaChip = getByTestId('betaChip');
    fireEvent.click(betaChip);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
