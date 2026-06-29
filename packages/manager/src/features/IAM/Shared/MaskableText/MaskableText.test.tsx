import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
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
      renderWithProviders(<MaskableText text={SECRET_TEXT} />);
      expect(screen.getByText(SECRET_TEXT)).toBeVisible();
    });

    it('renders children instead of text when provided', () => {
      renderWithProviders(
        <MaskableText text={SECRET_TEXT}>
          <span>custom child</span>
        </MaskableText>
      );
      expect(screen.getByText('custom child')).toBeVisible();
      expect(screen.queryByText(SECRET_TEXT)).not.toBeInTheDocument();
    });

    it('renders nothing when text is empty', () => {
      const { container } = renderWithProviders(<MaskableText text="" />);
      expect(container).toBeEmptyDOMElement();
    });

    it('does not render the toggle button', () => {
      renderWithProviders(<MaskableText isToggleable text={SECRET_TEXT} />);
      expect(screen.queryByTestId(TOGGLE_TEST_ID)).not.toBeInTheDocument();
    });
  });

  describe('when masking is enabled', () => {
    beforeEach(() => {
      queryMocks.usePreferences.mockReturnValue({ data: true });
    });

    it('renders masked dots instead of plain text by default', () => {
      renderWithProviders(<MaskableText text="secret-value" />);
      expect(screen.queryByText('secret-value')).not.toBeInTheDocument();
      expect(screen.getByText('•'.repeat(12))).toBeVisible();
    });

    it('renders masked dots with custom length', () => {
      renderWithProviders(<MaskableText length={6} text="secret-value" />);
      expect(screen.getByText('•'.repeat(6))).toBeVisible();
    });

    it('renders nothing when text is empty', () => {
      const { container } = renderWithProviders(<MaskableText text="" />);
      expect(container).toBeEmptyDOMElement();
    });

    describe('toggle behavior', () => {
      it('does not render toggle button when isToggleable is false', () => {
        renderWithProviders(<MaskableText text={SECRET_TEXT} />);
        expect(screen.queryByTestId(TOGGLE_TEST_ID)).not.toBeInTheDocument();
      });

      it('renders toggle button when isToggleable is true', () => {
        renderWithProviders(<MaskableText isToggleable text={SECRET_TEXT} />);
        screen.getByTestId(TOGGLE_TEST_ID);
      });

      it('reveals text when toggle button is clicked', async () => {
        renderWithProviders(<MaskableText isToggleable text={SECRET_TEXT} />);
        expect(screen.queryByText(SECRET_TEXT)).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId(TOGGLE_TEST_ID));

        expect(screen.getByText(SECRET_TEXT)).toBeVisible();
      });

      it('masks text again when toggle button is clicked twice', async () => {
        renderWithProviders(<MaskableText isToggleable text={SECRET_TEXT} />);

        await userEvent.click(screen.getByTestId(TOGGLE_TEST_ID));
        await userEvent.click(screen.getByTestId(TOGGLE_TEST_ID));

        expect(screen.queryByText(SECRET_TEXT)).not.toBeInTheDocument();
        expect(screen.getByText('•'.repeat(12))).toBeVisible();
      });
    });
  });
});
