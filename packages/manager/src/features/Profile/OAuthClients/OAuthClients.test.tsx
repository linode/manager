import React from 'react';
import OAuthClients from './OAuthClients';
import { oauthClientFactory } from 'src/factories/accountOAuth';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { rest, server } from 'src/mocks/testServer';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { waitForElementToBeRemoved } from '@testing-library/react';

describe('Maintenance Table Row', () => {
  const clients = oauthClientFactory.buildList(3);

  it('should render oauth clients that come from the API', async () => {
    server.use(
      rest.get('*/account/oauth-clients', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(clients)));
      })
    );

    const { getByText, getByTestId } = renderWithTheme(<OAuthClients />);

    await waitForElementToBeRemoved(getByTestId('table-row-loading'));

    for (const client of clients) {
      getByText(client.label);
      getByText(client.id);
    }
  });
});
