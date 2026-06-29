import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateApiKeyDrawer } from './CreateApiKeyDrawer';

const defaultProps = {
  onClose: vi.fn(),
  open: true,
};

describe('CreateApiKeyDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the drawer with title', () => {
    const { getByRole } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    expect(getByRole('heading', { name: 'Create API Key' })).toBeVisible();
  });

  it('renders the label field', () => {
    const { getByLabelText } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    expect(getByLabelText('Name')).toBeVisible();
  });

  it('renders the description field', () => {
    const { getByLabelText } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    expect(getByLabelText('Description')).toBeVisible();
  });

  it('renders expiry options', () => {
    const { getByRole } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    // getByRole throws if element is not found, so just calling it verifies presence
    getByRole('radio', { name: 'In 6 months' });
    getByRole('radio', { name: 'In 3 months' });
    getByRole('radio', { name: 'Never' });
    // TODO: Re-enable when custom expiry option is implemented
    // getByRole('radio', { name: 'Custom' });
  });

  it('has 6 months selected by default', () => {
    const { getByRole } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    expect(getByRole('radio', { name: 'In 6 months' })).toBeChecked();
  });

  it('shows error when submitting without a label', async () => {
    const { getByText } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    const createButton = getByText('Create API key');
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(getByText('Name is required')).toBeVisible();
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const { getByText } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    const cancelButton = getByText('Cancel');
    await userEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('creates an API key successfully', async () => {
    server.use(
      http.post('*/v4beta/inference/api-keys', () => {
        return HttpResponse.json({
          allowed_models: ['*'],
          created: '2024-01-01T00:00:00Z',
          description: 'Test description',
          expiry: '2024-07-01T00:00:00Z',
          id: 1,
          key: 'linf_abc123_full_secret_key',
          key_prefix: 'linf_abc123',
          key_type: 'user',
          label: 'Test Key',
          last_used: null,
          status: 'active',
          updated: '2024-01-01T00:00:00Z',
        });
      })
    );

    const { getByLabelText, getByText } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} />
    );

    const labelInput = getByLabelText('Name');
    await userEvent.type(labelInput, 'Test Key');

    const createButton = getByText('Create API key');
    await userEvent.click(createButton);

    // Should show the secret token dialog with the confirmation button
    await waitFor(() => {
      expect(getByText('I Have Saved My API Key')).toBeVisible();
    });
  });

  it('does not render when open is false', () => {
    const { queryByRole } = renderWithTheme(
      <CreateApiKeyDrawer {...defaultProps} open={false} />
    );

    expect(
      queryByRole('heading', { name: 'Create API Key' })
    ).not.toBeInTheDocument();
  });

  // TODO: Re-enable when custom date picker is implemented
  // it('shows custom date picker when Custom expiry is selected', async () => {
  //   const { getByLabelText, getByText } = renderWithTheme(
  //     <CreateApiKeyDrawer {...defaultProps} />
  //   );

  //   const customRadio = getByLabelText('Custom');
  //   await userEvent.click(customRadio);

  //   expect(getByText('Custom')).toBeVisible();
  // });
});
