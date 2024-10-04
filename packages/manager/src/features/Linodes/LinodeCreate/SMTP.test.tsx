import React from 'react';

import { accountFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SMTP } from './SMTP';

describe('SMTP', () => {
  it('should render if the account was activated before MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED', async () => {
    const account = accountFactory.build({
      active_since: '2022-11-29T00:00:00.000',
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { findByText } = renderWithTheme(<SMTP />);

    await findByText('SMTP ports may be restricted on this Linode', {
      exact: false,
    });
  });
});
