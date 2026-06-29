import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { apiKeyFactory } from 'src/factories/inferencePlatform';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RevokeApiKeyDialog } from './RevokeApiKeyDialog';

const mockApiKey = apiKeyFactory.build({ label: 'my-api-key' });

const defaultProps = {
  apiKey: mockApiKey,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  open: true,
};

describe('RevokeApiKeyDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog with warning message', () => {
    const { getByText } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} />
    );

    expect(
      getByText('Are you sure you want to revoke this key?')
    ).toBeVisible();
    expect(getByText('This action cannot be undone.')).toBeVisible();
  });

  it('renders the title with the key label', () => {
    const { getByText } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} />
    );

    expect(getByText('Revoke key my-api-key')).toBeVisible();
  });

  it('displays the key label to confirm', () => {
    const { getByText } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} />
    );

    expect(getByText('my-api-key')).toBeVisible();
  });

  it('disables the revoke button when confirmation text does not match', () => {
    const { getByTestId } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} />
    );

    const revokeButton = getByTestId('revoke-api-key-confirm');
    expect(revokeButton).toBeDisabled();
  });

  it('enables the revoke button when confirmation text matches', async () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} />
    );

    const input = getByLabelText('API Key Name');
    await userEvent.type(input, 'my-api-key');

    const revokeButton = getByTestId('revoke-api-key-confirm');
    expect(revokeButton).toBeEnabled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const { getByTestId } = renderWithTheme(
      <RevokeApiKeyDialog {...defaultProps} />
    );

    const cancelButton = getByTestId('revoke-api-key-cancel');
    await userEvent.click(cancelButton);

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
