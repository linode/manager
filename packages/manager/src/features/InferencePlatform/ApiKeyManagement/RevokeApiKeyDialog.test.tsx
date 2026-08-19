import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { apiKeyFactory } from 'src/factories/inferencePlatform';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RevokeApiKeyDialog } from './RevokeApiKeyDialog';

const API_KEY_LABEL = 'my-api-key';
const mockApiKey = apiKeyFactory.build({ label: API_KEY_LABEL });

const defaultProps = {
  apiKey: mockApiKey,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  open: true,
};

/**
 * Helper to find a CDS button host element by its text content
 */
const getCdsButtonHostByText = (
  root: ParentNode,
  text: string
): HTMLElement | undefined =>
  // eslint-disable-next-line testing-library/no-node-access -- CDS web component
  Array.from(root.querySelectorAll<HTMLElement>('cds-button')).find(
    (button) => button.textContent?.trim() === text
  );

describe('RevokeApiKeyDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog with warning message', () => {
    renderWithTheme(<RevokeApiKeyDialog {...defaultProps} />);

    // Dialog renders into document.body via portal
    // eslint-disable-next-line testing-library/no-node-access -- CDS web component
    const banner = document.body.querySelector('cds-notification-banner');
    expect(banner).toBeInTheDocument();
  });

  it('renders the title with the key label', () => {
    const { getByText } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} />
    );

    expect(getByText(`Revoke key ${API_KEY_LABEL}`)).toBeVisible();
  });

  it('displays the key label to confirm', () => {
    const { getByText } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} />
    );

    expect(getByText(API_KEY_LABEL)).toBeVisible();
  });

  it('disables the revoke button when confirmation text does not match', () => {
    renderWithTheme(<RevokeApiKeyDialog {...defaultProps} />);

    const revokeButton = getCdsButtonHostByText(
      document.body,
      'Revoke API key'
    ) as HTMLElement & { disabled?: boolean };
    expect(revokeButton).toBeInTheDocument();
    // CDS Button reflects disabled as a JS property, not an HTML attribute
    expect(revokeButton?.disabled).toBe(true);
  });

  it('enables the revoke button when confirmation text matches', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} />
    );

    const input = getByLabelText('API Key Name');
    await user.type(input, API_KEY_LABEL);

    const revokeButton = getCdsButtonHostByText(
      document.body,
      'Revoke API key'
    ) as HTMLElement & { disabled?: boolean };
    expect(revokeButton).toBeInTheDocument();
    expect(revokeButton?.disabled).not.toBe(true);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<RevokeApiKeyDialog {...defaultProps} />);

    const cancelButton = getCdsButtonHostByText(document.body, 'Cancel');
    expect(cancelButton).toBeVisible();
    await user.click(cancelButton!);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not render when open is false', () => {
    const { queryByText } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} open={false} />
    );

    expect(
      queryByText('Are you sure you want to revoke this key?')
    ).not.toBeInTheDocument();
  });

  it('handles null apiKey gracefully', () => {
    const { queryByText } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} apiKey={null} />
    );

    expect(queryByText('Revoke key')).toBeVisible();
  });
});
