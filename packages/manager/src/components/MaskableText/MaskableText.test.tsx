import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaskableText } from './MaskableText';

import type { MaskableTextProps } from './MaskableText';

describe('MaskableText', () => {
  const maskedText = '•••••••••••';
  const plainText = 'my-username';

  const defaultProps: MaskableTextProps = {
    isMaskedPreferenceEnabled: true,
    isToggleable: false,
    text: plainText,
  };

  it('should render masked text if the maskSensitiveData preference is enabled', () => {
    const { getByText, queryByText } = renderWithTheme(
      <MaskableText {...defaultProps} />
    );

    // Original text should be masked
    expect(getByText(maskedText)).toBeVisible();
    expect(queryByText(plainText)).not.toBeInTheDocument();
  });

  it('should not render masked text if the maskSensitiveData preference is disabled', () => {
    const { getByText, queryByText } = renderWithTheme(
      <MaskableText {...defaultProps} isMaskedPreferenceEnabled={false} />
    );

    // Original text should be visible
    expect(getByText(plainText)).toBeVisible();
    expect(queryByText(maskedText)).not.toBeInTheDocument();
  });

  it("should render MaskableText's children if the maskSensitiveData preference is disabled and children are provided", () => {
    const plainTextElement = <div>{plainText}</div>;
    const { getByText, queryByText } = renderWithTheme(
      <MaskableText {...defaultProps} isMaskedPreferenceEnabled={false}>
        {plainTextElement}
      </MaskableText>
    );

    // Original text should be visible
    expect(getByText(plainText)).toBeInTheDocument();
    expect(queryByText(maskedText)).not.toBeInTheDocument();
  });

  it('should render a toggleable VisibilityIcon tooltip if isToggleable is provided', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <MaskableText {...defaultProps} isToggleable />
    );

    const visibilityToggle = getByTestId('VisibilityIcon');

    // Original text should be masked
    expect(getByText(maskedText)).toBeVisible();

    await userEvent.click(visibilityToggle);

    // Original text should be unmasked
    expect(getByText(plainText)).toBeVisible();
  });
});
