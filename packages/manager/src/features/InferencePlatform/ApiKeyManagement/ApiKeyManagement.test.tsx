import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { apiKeyFactory } from 'src/factories/inferencePlatform';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ApiKeyManagement } from './ApiKeyManagement';

const mockApiKeys = apiKeyFactory.buildList(5);

describe('ApiKeyManagement', () => {
  beforeEach(() => {
    server.use(
      http.get('*/v4beta/inference-platform/api-keys', () => {
        return HttpResponse.json({
          data: mockApiKeys,
          page: 1,
          pages: 1,
          results: mockApiKeys.length,
        });
      })
    );
  });

  it('renders the filter text field', () => {
    const { getByPlaceholderText } = renderWithTheme(<ApiKeyManagement />);
    expect(
      getByPlaceholderText('Filter by name, ID, key, models...')
    ).toBeVisible();
  });

  it('renders the status filter dropdown', () => {
    const { getByRole } = renderWithTheme(<ApiKeyManagement />);
    // The autocomplete should have "All" as the default selected value
    expect(getByRole('combobox', { name: 'Status' })).toBeVisible();
  });

  it('renders the show playground keys checkbox', () => {
    const { getByText } = renderWithTheme(<ApiKeyManagement />);
    expect(getByText('Show playground keys')).toBeVisible();
  });

  it('renders the create API key button', () => {
    const { getByText } = renderWithTheme(<ApiKeyManagement />);
    expect(getByText('Create API Key')).toBeVisible();
  });

  it('opens create drawer when create button is clicked', async () => {
    const { getByRole, getByText } = renderWithTheme(<ApiKeyManagement />);

    const createButton = getByText('Create API Key');
    await userEvent.click(createButton);

    // Check for the drawer heading
    expect(getByRole('heading', { name: 'Create API Key' })).toBeVisible();
  });

  it('has playground keys checkbox checked by default', () => {
    const { getByRole } = renderWithTheme(<ApiKeyManagement />);
    const checkbox = getByRole('checkbox', { name: 'Show playground keys' });
    expect(checkbox).toBeChecked();
  });

  it('allows toggling the playground keys checkbox', async () => {
    const { getByRole } = renderWithTheme(<ApiKeyManagement />);
    const checkbox = getByRole('checkbox', { name: 'Show playground keys' });

    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('allows typing in the filter field', async () => {
    const { getByPlaceholderText } = renderWithTheme(<ApiKeyManagement />);
    const filterInput = getByPlaceholderText(
      'Filter by name, ID, key, models...'
    );

    await userEvent.type(filterInput, 'test-key');
    expect(filterInput).toHaveValue('test-key');
  });
});
