import { regionFactory } from '@linode/utilities';
import React from 'react';

import { accountAgreementsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { EUAgreement } from './EUAgreement';

import type { LinodeCreateFormValues } from './utilities';

describe('EUAgreement', () => {
  it('it renders if an EU region is selected and you have not already agreed to the agreement', async () => {
    const region = regionFactory.build({
      capabilities: ['Linodes'],
      country: 'uk',
      id: 'eu-west',
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      }),
      http.get('*/v4/account/agreements', () => {
        return HttpResponse.json(
          accountAgreementsFactory.build({ eu_model: false })
        );
      })
    );

    const { findByText, getByRole } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <EUAgreement />,
        useFormOptions: {
          defaultValues: {
            region: 'eu-west',
          },
        },
      });

    await findByText('Agreements');
    const checkbox = getByRole('checkbox');

    expect(checkbox).toBeEnabled();
    expect(checkbox).not.toBeChecked();
  });
});
