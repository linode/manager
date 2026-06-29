import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { CopyTooltip } from './CopyTooltip';

import type { CopyTooltipProps } from './CopyTooltip';

const mockText = 'Hello world';

const defaultProps: CopyTooltipProps = {
  onClickCallback: vi.fn(),
  text: mockText,
};

describe('CopyTooltip', () => {
  it('renders a copy button with the correct aria-label', () => {
    renderWithProviders(<CopyTooltip {...defaultProps} />);

    expect(
      screen.getByLabelText(`Copy ${mockText} to clipboard`)
    ).toBeInTheDocument();
  });

  it('calls onClickCallback when clicked', async () => {
    const onClickCallback = vi.fn();
    renderWithProviders(
      <CopyTooltip {...defaultProps} onClickCallback={onClickCallback} />
    );

    await userEvent.click(
      screen.getByLabelText(`Copy ${mockText} to clipboard`)
    );

    expect(onClickCallback).toHaveBeenCalledTimes(1);
  });

  it('renders a disabled button when disabled without a reason', () => {
    renderWithProviders(<CopyTooltip {...defaultProps} disabled />);

    expect(
      screen.getByLabelText(`Copy ${mockText} to clipboard`)
    ).toBeDisabled();
  });

  it('does not call onClickCallback when disabled with a reason', async () => {
    const onClickCallback = vi.fn();
    renderWithProviders(
      <CopyTooltip
        {...defaultProps}
        disabled
        disabledReason="Cluster is provisioning"
        onClickCallback={onClickCallback}
      />
    );

    await userEvent.click(
      screen.getByLabelText(`Copy ${mockText} to clipboard`)
    );

    expect(onClickCallback).not.toHaveBeenCalled();
  });

  it('does not disable the button element when disabledReason is provided', () => {
    renderWithProviders(
      <CopyTooltip
        {...defaultProps}
        disabled
        disabledReason="Cluster is provisioning"
      />
    );

    // Button stays enabled so the tooltip remains accessible on hover;
    // click is suppressed via the onClick guard instead.
    expect(
      screen.getByLabelText(`Copy ${mockText} to clipboard`)
    ).not.toBeDisabled();
  });
});
