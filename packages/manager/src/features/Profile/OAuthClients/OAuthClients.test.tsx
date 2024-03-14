import { waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';

import { oauthClientFactory } from 'src/factories/accountOAuth';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import OAuthClients from './OAuthClients';

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
});
