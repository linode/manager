import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaskableText } from './MaskableText';

import type { MaskableTextProps } from './MaskableText';
import type { ManagerPreferences } from 'src/types/ManagerPreferences';

describe('MaskableText', () => {
  const maskedText = '•••••••••••';
  const plainText = 'my-username';

  const defaultProps: MaskableTextProps = {
    isToggleable: false,
    length: 'plaintext',
    text: plainText,
  };

  const preference: ManagerPreferences['maskSensitiveData'] = true;

  const queryMocks = vi.hoisted(() => ({
    usePreferences: vi.fn().mockReturnValue({}),
  }));

  vi.mock('src/queries/profile/preferences', async () => {
    const actual = await vi.importActual('src/queries/profile/preferences');
    return {
      ...actual,
      usePreferences: queryMocks.usePreferences,
    };
  });

  queryMocks.usePreferences.mockReturnValue({
    data: preference,
  });

  it('should render masked text if the maskSensitiveData preference is enabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const { getByText, queryByText } = renderWithTheme(
      <MaskableText {...defaultProps} />
    );

    // Original text should be masked
    expect(getByText(maskedText)).toBeVisible();
    expect(queryByText(plainText)).not.toBeInTheDocument();
  });

  it('should not render masked text if the maskSensitiveData preference is disabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
    });

    const { getByText, queryByText } = renderWithTheme(
      <MaskableText {...defaultProps} />
    );

    // Original text should be visible
    expect(getByText(plainText)).toBeVisible();
    expect(queryByText(maskedText)).not.toBeInTheDocument();
  });

  it("should render MaskableText's children if the maskSensitiveData preference is disabled and children are provided", () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
    });

    const plainTextElement = <div>{plainText}</div>;
    const { getByText, queryByText } = renderWithTheme(
      <MaskableText {...defaultProps}>{plainTextElement}</MaskableText>
    );

    // Original text should be visible
    expect(getByText(plainText)).toBeInTheDocument();
    expect(queryByText(maskedText)).not.toBeInTheDocument();
  });

  it('should render a toggleable VisibilityTooltip if isToggleable is provided', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const { getByTestId, getByText } = renderWithTheme(
      <MaskableText {...defaultProps} isToggleable />
    );

    const visibilityToggle = getByTestId('VisibilityTooltip');

    // Original text should be masked
    expect(getByText(maskedText)).toBeVisible();

    await userEvent.click(visibilityToggle);

    // Original text should be unmasked
    expect(getByText(plainText)).toBeVisible();
  });
});
