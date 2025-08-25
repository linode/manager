import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeEntityDetailFooter } from './LinodeEntityDetailFooter';

const props = {
  linodeCreated: '2018-11-01T00:00:00',
  linodeId: 1,
  linodeLabel: 'test-linode',
  linodePlan: 'Linode 4GB',
  linodeRegionDisplay: 'us-east',
  linodeTags: ['test', 'linode'],
};

describe('LinodeEntityDetailFooter', () => {
  it('should disable the "Add a tag" button by default', async () => {
    const { getByRole } = renderWithTheme(
      <LinodeEntityDetailFooter {...props} />
    );

    expect(getByRole('button', { name: 'Add a tag' })).toBeDisabled();
  });

  it('should enable the "Add a tag" button if the user is unrestricted (legacy grants)', async () => {
    server.use(
      http.get('*/v4*/profile', () =>
        HttpResponse.json(profileFactory.build({ restricted: false }))
      )
    );

    const { getByRole } = renderWithTheme(
      <LinodeEntityDetailFooter {...props} />
    );

    await waitFor(() => {
      expect(getByRole('button', { name: 'Add a tag' })).toBeEnabled();
    });
  });

  it('should enable the "Add a tag" button if the user is an account admin (IAM)', async () => {
    server.use(
      http.get('*/v4*/profile', () =>
        HttpResponse.json(profileFactory.build({ restricted: true }))
      ),
      http.get('*/v4*/iam/users/:username/permissions/account', () =>
        HttpResponse.json(['is_account_admin'])
      )
    );

    const { getByRole } = renderWithTheme(
      <LinodeEntityDetailFooter {...props} />,
      { flags: { iam: { enabled: true, beta: true } } }
    );

    await waitFor(() => {
      expect(getByRole('button', { name: 'Add a tag' })).toBeEnabled();
    });
  });
});
