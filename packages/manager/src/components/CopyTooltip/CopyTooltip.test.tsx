import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CopyTooltip } from './CopyTooltip';

import type { CopyTooltipProps } from './CopyTooltip';

const mockText = 'Hello world';

const defaultProps: CopyTooltipProps = {
  onClickCallback: vi.fn(),
  text: mockText,
};

describe('CopyTooltip', () => {
  it('should render the copy icon button and tooltip', async () => {
    const { findByRole, getByLabelText } = renderWithTheme(
      <CopyTooltip {...defaultProps} />
    );

    const copyIconButton = getByLabelText(`Copy ${mockText} to clipboard`);

    await userEvent.hover(copyIconButton);

    const copyTooltip = await findByRole('tooltip');
    expect(copyTooltip).toBeInTheDocument();
    expect(copyTooltip).toHaveTextContent('Copy');

    await userEvent.click(copyIconButton);

    const copiedTooltip = await findByRole('tooltip');
    expect(copiedTooltip).toBeInTheDocument();
    expect(copiedTooltip).toHaveTextContent('Copied!');
  });

  it('should render text with the copyableText property', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <CopyTooltip {...defaultProps} copyableText />
    );

    expect(getByLabelText(`Copy ${mockText} to clipboard`)).toBeInTheDocument();
    expect(getByText(mockText)).toBeVisible();
  });

  it('should disable the tooltip text with the disable property', async () => {
    const { getByLabelText } = renderWithTheme(
      <CopyTooltip {...defaultProps} disabled />
    );

    const copyIconButton = getByLabelText(`Copy ${mockText} to clipboard`);
    expect(copyIconButton).toBeDisabled();
  });

  it('should mask and toggle visibility of tooltip text with the masked property', async () => {
    const { getByLabelText, getByTestId, getByText, queryByText } =
      renderWithTheme(
        <CopyTooltip
          {...defaultProps}
          copyableText
          masked
          maskedTextLength="plaintext"
        />
      );

    const copyIconButton = getByLabelText(`Copy ${mockText} to clipboard`);
    const visibilityToggle = getByTestId('VisibilityTooltip');

    // Text should be masked
    expect(copyIconButton).toBeInTheDocument();
    expect(getByText('•••••••••••')).toBeVisible();
    expect(queryByText(mockText)).toBeNull();

    await userEvent.click(visibilityToggle);

    // Text should be unmasked
    expect(getByText('Hello world')).toBeVisible();
  });
});
