import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';

import { oauthClientFactory } from 'src/factories/accountOAuth';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import OAuthClients from './OAuthClients';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_oauth_client: false,
      update_oauth_client: false,
      delete_oauth_client: false,
      reset_oauth_client_secret: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('Maintenance Table Row', () => {
  const clients = oauthClientFactory.buildList(3);

  it('should render oauth clients that come from the API', async () => {
    server.use(
      http.get('*/account/oauth-clients', () => {
        return HttpResponse.json(makeResourcePage(clients));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(<OAuthClients />);

    await waitForElementToBeRemoved(getByTestId('table-row-loading'));

    for (const client of clients) {
      getByText(client.label);
      getByText(client.id);
    }
  });

  it('should disable "Add an OAuth App" button if user does not have create_oauth_client permission', () => {
    const { getByRole } = renderWithTheme(<OAuthClients />);

    const button = getByRole('button', { name: /add an oauth app/i });
    expect(button).toBeDisabled();
  });

  it('should disable menu buttons if user does not have permission', async () => {
    const { getAllByRole } = renderWithTheme(<OAuthClients />);

    server.use(
      http.get('*/account/oauth-clients', () => {
        return HttpResponse.json(makeResourcePage(clients));
      })
    );

    await waitFor(() => {
      const editBtn = getAllByRole('button', { name: 'Edit' })[0];
      expect(editBtn).toBeDisabled();

      const resetBtn = getAllByRole('button', { name: 'Reset' })[0];
      expect(resetBtn).toBeDisabled();

      const deleteBtn = getAllByRole('button', { name: 'Delete' })[0];
      expect(deleteBtn).toBeDisabled();
    });
  });

  it('should enable "Add an OAuth App" button if user has create_oauth_client permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_oauth_client: true,
        update_oauth_client: false,
        delete_oauth_client: false,
        reset_oauth_client_secret: false,
      },
    });

    const { getByRole } = renderWithTheme(<OAuthClients />);

    const button = getByRole('button', { name: /add an oauth app/i });
    expect(button).toBeEnabled();
  });

  it('should enable menu buttons if user has permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_oauth_client: true,
        update_oauth_client: true,
        delete_oauth_client: true,
        reset_oauth_client_secret: true,
      },
    });

    const { getAllByRole } = renderWithTheme(<OAuthClients />);

    server.use(
      http.get('*/account/oauth-clients', () => {
        return HttpResponse.json(makeResourcePage(clients));
      })
    );

    await waitFor(() => {
      const editBtn = getAllByRole('button', { name: 'Edit' })[0];
      expect(editBtn).toBeEnabled();

      const resetBtn = getAllByRole('button', { name: 'Reset' })[0];
      expect(resetBtn).toBeEnabled();

      const deleteBtn = getAllByRole('button', { name: 'Delete' })[0];
      expect(deleteBtn).toBeEnabled();
    });
  });
});
