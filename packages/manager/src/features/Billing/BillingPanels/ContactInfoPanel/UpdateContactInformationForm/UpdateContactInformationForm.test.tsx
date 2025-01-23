import * as React from 'react';

import { accountFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import UpdateContactInformationForm from './UpdateContactInformationForm';

describe('UpdateContactInformationForm', () => {
  it('should disable the save button when country is non-US and tax ID is empty', () => {
    const account = accountFactory.build({
      country: 'GB',
      tax_id: '',
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { getByTestId } = renderWithTheme(
      <UpdateContactInformationForm focusEmail={false} onClose={() => null} />,
      {
        flags: {
          taxId: {
            enabled: true,
          },
        },
      }
    );

    expect(getByTestId('save-contact-info')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
