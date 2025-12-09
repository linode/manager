import { regionFactory } from '@linode/utilities';
import React from 'react';

import { accountAgreementsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { EUAgreement } from './EUAgreement';

import type { LinodeCreateFormValues } from './utilities';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      acknowledge_account_agreement: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('EUAgreement', () => {
  it('should disable checkbox if the user does not have acknowledge_account_agreement permission', async () => {
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

    expect(checkbox).toBeDisabled();
  });

  it('it renders if an EU region is selected and you have not already agreed to the agreement, and user has acknowledge_account_agreement permission', async () => {
    const region = regionFactory.build({
      capabilities: ['Linodes'],
      country: 'uk',
      id: 'eu-west',
    });

    queryMocks.userPermissions.mockReturnValue({
      data: {
        acknowledge_account_agreement: true,
      },
    });
    server.use(
      http.get('*/v4*/regions', () => {
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
