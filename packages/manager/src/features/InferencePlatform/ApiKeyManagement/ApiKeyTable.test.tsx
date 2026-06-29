import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { apiKeyFactory } from 'src/factories/inferencePlatform';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ApiKeyTable } from './ApiKeyTable';

const mockApiKeys = [
  apiKeyFactory.build({
    key_type: 'user',
    label: 'User Key 1',
    status: 'active',
  }),
  apiKeyFactory.build({
    key_type: 'playground',
    label: 'Playground Key 1',
    status: 'active',
  }),
  apiKeyFactory.build({
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
    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });
});
