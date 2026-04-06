import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaskableText } from './MaskableText';

import type { MaskableTextProps } from './MaskableText';
import type { ManagerPreferences } from '@linode/utilities';

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

  vi.mock('@linode/queries', async () => {
    const actual = await vi.importActual('@linode/queries');
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

  it.each<[MaskableTextProps['length'], number]>([
    // length prop     expected masked length
    [undefined, 12], // default fallback
    ['plaintext', 12], // DEFAULT_MASKED_TEXT_LENGTH for JSX
    ['ipv4', 15], // from MASKABLE_TEXT_LENGTH_MAP
    ['ipv6', 30], // from MASKABLE_TEXT_LENGTH_MAP
    [8, 8], // custom numeric value
  ])(
    'should mask JSX list correctly when masking is enabled (length=%s)',
    (lengthProp, expectedLength) => {
      queryMocks.usePreferences.mockReturnValue({ data: preference });

      const jsxList = (
        <ul>
          <li>item1</li>
          <li>item2</li>
          <li>secret-value</li>
        </ul>
      );

      const expectedMasked = '•'.repeat(expectedLength);

      const { getByText, queryByText } = renderWithTheme(
        <MaskableText length={lengthProp} text={jsxList} />
      );

      // Masking works
      expect(getByText(expectedMasked)).toBeVisible();

      // The JSX list content must NOT show
      expect(queryByText('item1')).not.toBeInTheDocument();
      expect(queryByText('item2')).not.toBeInTheDocument();
      expect(queryByText('secret-value')).not.toBeInTheDocument();
    }
  );

  it('should render JSX list unmasked when masking preference is disabled', () => {
    queryMocks.usePreferences.mockReturnValue({ data: false });

    const jsxList = (
      <ul>
        <li>item1</li>
        <li>item2</li>
        <li>secret-value</li>
      </ul>
    );

    const { getByText, queryByText } = renderWithTheme(
      <MaskableText length={8} text={jsxList} />
    );

    const maskedText = '•'.repeat(8);

    // Original JSX content should be visible
    expect(getByText('item1')).toBeVisible();
    expect(getByText('item2')).toBeVisible();
    expect(getByText('secret-value')).toBeVisible();

    // Masked text should NOT appear
    expect(queryByText(maskedText)).not.toBeInTheDocument();
  });
});
