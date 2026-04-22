import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaskableText } from './MaskableText';

const SECRET_TEXT = 'text-to-be-masked';
const TOGGLE_TEST_ID = 'maskable-text-toggle';

const queryMocks = vi.hoisted(() => ({
  usePreferences: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return { ...actual, usePreferences: queryMocks.usePreferences };
});

describe('MaskableText', () => {
  describe('when masking is disabled', () => {
    beforeEach(() => {
      queryMocks.usePreferences.mockReturnValue({ data: false });
    });

    it('renders the plain text unmasked', () => {
      renderWithTheme(<MaskableText text={SECRET_TEXT} />);
      expect(screen.getByText(SECRET_TEXT)).toBeVisible();
    });

    it('renders children instead of text when provided', () => {
      renderWithTheme(
        <MaskableText text={SECRET_TEXT}>
          <span>custom child</span>
        </MaskableText>
      );
      expect(screen.getByText('custom child')).toBeVisible();
      expect(screen.queryByText(SECRET_TEXT)).not.toBeInTheDocument();
    });

    it('renders nothing when text is empty', () => {
      const { container } = renderWithTheme(<MaskableText text="" />);
      expect(container).toBeEmptyDOMElement();
    });

    it('does not render the toggle button', () => {
      renderWithTheme(<MaskableText isToggleable text={SECRET_TEXT} />);
      expect(screen.queryByTestId(TOGGLE_TEST_ID)).not.toBeInTheDocument();
    });
  });

  describe('when masking is enabled', () => {
    beforeEach(() => {
      queryMocks.usePreferences.mockReturnValue({ data: true });
    });

    it('renders masked dots instead of plain text by default', () => {
      renderWithTheme(<MaskableText text="secret-value" />);
      expect(screen.queryByText('secret-value')).not.toBeInTheDocument();
      expect(screen.getByText('•'.repeat(12))).toBeVisible();
    });

    it('renders masked dots with custom length', () => {
      renderWithTheme(<MaskableText length={6} text="secret-value" />);
      expect(screen.getByText('•'.repeat(6))).toBeVisible();
    });

    it('renders nothing when text is empty', () => {
      const { container } = renderWithTheme(<MaskableText text="" />);
      expect(container).toBeEmptyDOMElement();
    });

    describe('toggle behavior', () => {
      it('does not render toggle button when isToggleable is false', () => {
        renderWithTheme(<MaskableText text={SECRET_TEXT} />);
        expect(screen.queryByTestId(TOGGLE_TEST_ID)).not.toBeInTheDocument();
      });

      it('renders toggle button when isToggleable is true', () => {
        renderWithTheme(<MaskableText isToggleable text={SECRET_TEXT} />);
        screen.getByTestId(TOGGLE_TEST_ID);
      });

      it('reveals text when toggle button is clicked', async () => {
        renderWithTheme(<MaskableText isToggleable text={SECRET_TEXT} />);
        expect(screen.queryByText(SECRET_TEXT)).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId(TOGGLE_TEST_ID));

        expect(screen.getByText(SECRET_TEXT)).toBeVisible();
      });

      it('masks text again when toggle button is clicked twice', async () => {
        renderWithTheme(<MaskableText isToggleable text={SECRET_TEXT} />);

        await userEvent.click(screen.getByTestId(TOGGLE_TEST_ID));
        await userEvent.click(screen.getByTestId(TOGGLE_TEST_ID));

        expect(screen.queryByText(SECRET_TEXT)).not.toBeInTheDocument();
        expect(screen.getByText('•'.repeat(12))).toBeVisible();
      });
    });
  });
});
