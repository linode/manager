import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { apiKeyFactory } from 'src/factories/inferencePlatform';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ApiKeyTable } from './ApiKeyTable';

const mockApiKeys = [
  apiKeyFactory.build({
    expiry: '2027-01-01T00:00:00Z',
    key_type: 'user',
    label: 'User Key 1',
    status: 'active',
  }),
  apiKeyFactory.build({
    expiry: null,
    key_type: 'playground',
    label: 'Playground Key 1',
    status: 'active',
  }),
  apiKeyFactory.build({
    expiry: '2026-01-01T00:00:00Z',
    key_type: 'user',
    label: 'Revoked Key',
    status: 'revoked',
  }),
];

const defaultProps = {
  filter: '',
  showPlaygroundKeys: true,
  statusFilter: 'all' as const,
};

describe('ApiKeyTable', () => {
  beforeEach(() => {
    server.use(
      http.get('*/v4beta/inference/api-keys', () => {
        return HttpResponse.json({
          data: mockApiKeys,
          page: 1,
          pages: 1,
          results: mockApiKeys.length,
        });
      }),
      http.options('*/v4beta/inference/api-keys', () => {
        return new HttpResponse(null, { status: 200 });
      })
    );
  });

  it('renders table headers', async () => {
    const { getByText } = renderWithTheme(<ApiKeyTable {...defaultProps} />);

    await waitFor(() => {
      expect(getByText('Name')).toBeVisible();
    });

    expect(getByText('Key')).toBeVisible();
  });

  it('renders API keys from the server', async () => {
    const { getByText } = renderWithTheme(<ApiKeyTable {...defaultProps} />);

    await waitFor(() => {
      expect(getByText('User Key 1')).toBeVisible();
    });

    expect(getByText('Playground Key 1')).toBeVisible();
    expect(getByText('Revoked Key')).toBeVisible();
  });

  it('filters out playground keys when showPlaygroundKeys is false', async () => {
    const { getByText, queryByText } = renderWithTheme(
      <ApiKeyTable {...defaultProps} showPlaygroundKeys={false} />
    );

    await waitFor(() => {
      expect(getByText('User Key 1')).toBeVisible();
    });

    expect(queryByText('Playground Key 1')).not.toBeInTheDocument();
  });

  it('filters by text search', async () => {
    const { getByText, queryByText } = renderWithTheme(
      <ApiKeyTable {...defaultProps} filter="User Key 1" />
    );

    await waitFor(() => {
      expect(getByText('User Key 1')).toBeVisible();
    });

    expect(queryByText('Playground Key 1')).not.toBeInTheDocument();
    expect(queryByText('Revoked Key')).not.toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const { getByTestId } = renderWithTheme(<ApiKeyTable {...defaultProps} />);
    expect(getByTestId('loading-spinner')).toBeVisible();
  });

  it('renders columns in order: Name, Key, Allowed Models, Last used, Status, Expiry', async () => {
    const { getAllByRole } = renderWithTheme(<ApiKeyTable {...defaultProps} />);

    await waitFor(() => {
      expect(getAllByRole('columnheader').length).toBeGreaterThan(0);
    });

    const headerLabels = getAllByRole('columnheader')
      .map((h) => h.textContent?.trim())
      .filter(Boolean);

    // The trailing empty header (actions) is filtered out by `.filter(Boolean)`
    expect(headerLabels).toEqual([
      'Name',
      'Key',
      'Allowed Models',
      'Last used',
      'Status',
      'Expiry',
    ]);
  });

  it('renders "Never" for a key with null expiry', async () => {
    server.use(
      http.get('*/v4beta/inference/api-keys', () => {
        return HttpResponse.json({
          data: [
            apiKeyFactory.build({
              expiry: null,
              key_type: 'user',
              label: 'Never Expires Key',
            }),
          ],
          page: 1,
          pages: 1,
          results: 1,
        });
      })
    );

    const { getAllByText, getByText } = renderWithTheme(
      <ApiKeyTable {...defaultProps} />
    );

    await waitFor(() => {
      expect(getByText('Never Expires Key')).toBeVisible();
    });

    // "Never" appears both for Last used (null last_used) and Expires (null expiry)
    expect(getAllByText('Never').length).toBeGreaterThan(0);
  });

  it('renders a timestamp for a key with a real expiry', async () => {
    server.use(
      http.get('*/v4beta/inference/api-keys', () => {
        return HttpResponse.json({
          data: [
            apiKeyFactory.build({
              expiry: '2027-01-15T12:00:00Z',
              key_type: 'user',
              label: 'Dated Key',
            }),
          ],
          page: 1,
          pages: 1,
          results: 1,
        });
      })
    );

    const { getByText } = renderWithTheme(<ApiKeyTable {...defaultProps} />);

    await waitFor(() => {
      expect(getByText('Dated Key')).toBeVisible();
    });

    // Formatted date should include the year 2027
    expect(getByText(/2027/)).toBeVisible();
  });
});
