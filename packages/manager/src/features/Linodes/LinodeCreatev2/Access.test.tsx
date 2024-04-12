import { waitFor } from '@testing-library/react';
import React from 'react';

import { profileFactory, sshKeyFactory } from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Access } from './Access';

describe('Access', () => {
  it('should render a root password input', async () => {
    const { findByLabelText } = renderWithThemeAndHookFormContext({
      component: <Access />,
    });

    const rootPasswordInput = await findByLabelText('Root Password');

    expect(rootPasswordInput).toBeVisible();
    expect(rootPasswordInput).toBeEnabled();
  });

  it('should render a SSH Keys heading', async () => {
    const { getAllByText } = renderWithThemeAndHookFormContext({
      component: <Access />,
    });

    const heading = getAllByText('SSH Keys')[0];

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render an "Add An SSH Key" button', async () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Access />,
    });

    const addSSHKeyButton = getByText('Add an SSH Key');

    expect(addSSHKeyButton).toBeVisible();
    expect(addSSHKeyButton).toBeEnabled();
  });

  it('should disable the password input if the user does not have permission to create linodes', async () => {
    server.use(
      http.get('*/v4/profile', () => {
        return HttpResponse.json(profileFactory.build({ restricted: true }));
      }),
      http.get('*/v4/profile/sshkeys', () => {
        return HttpResponse.json(makeResourcePage([]));
      }),
      http.get('*/v4/profile/grants', () => {
        return HttpResponse.json(
          grantsFactory.build({ global: { add_linodes: false } })
        );
      })
    );

    const { findByLabelText } = renderWithThemeAndHookFormContext({
      component: <Access />,
    });

    const rootPasswordInput = await findByLabelText('Root Password');

    await waitFor(() => {
      expect(rootPasswordInput).toBeDisabled();
    });
  });

  it('should disable ssh key selection if the user does not have permission to create linodes', async () => {
    const sshKeys = sshKeyFactory.buildList(3);
    server.use(
      http.get('*/v4/profile', () => {
        return HttpResponse.json(profileFactory.build({ restricted: true }));
      }),
      http.get('*/v4/profile/sshkeys', () => {
        return HttpResponse.json(makeResourcePage(sshKeys));
      }),
      http.get('*/v4/profile/grants', () => {
        return HttpResponse.json(
          grantsFactory.build({ global: { add_linodes: false } })
        );
      })
    );

    const { findByText, getByRole } = renderWithThemeAndHookFormContext({
      component: <Access />,
    });

    // Make sure the restricted user's SSH keys are loaded
    for (const sshKey of sshKeys) {
      // eslint-disable-next-line no-await-in-loop
      expect(await findByText(sshKey.label, { exact: false })).toBeVisible();
    }

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeDisabled();
    });
  });
});
