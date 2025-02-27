import { waitFor } from '@testing-library/react';
import React from 'react';

import {
  accountFactory,
  profileFactory,
  regionFactory,
  sshKeyFactory,
} from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Security } from './Security';

import type { LinodeCreateFormValues } from './utilities';

describe('Security', () => {
  // TODO: Unskip once M3-8559 is addressed.
  it.skip('should render a root password input', async () => {
    const { findByLabelText } = renderWithThemeAndHookFormContext({
      component: <Security />,
    });

    const rootPasswordInput = await findByLabelText('Root Password');

    expect(rootPasswordInput).toBeVisible();
    expect(rootPasswordInput).toBeEnabled();
  });

  it('should render a SSH Keys heading', async () => {
    const { getAllByText } = renderWithThemeAndHookFormContext({
      component: <Security />,
    });

    const heading = getAllByText('SSH Keys')[0];

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render an "Add An SSH Key" button', async () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Security />,
    });

    const addSSHKeyButton = getByText('Add an SSH Key');

    expect(addSSHKeyButton).toBeVisible();
    expect(addSSHKeyButton).toBeEnabled();
  });

  // TODO: Unskip once M3-8559 is addressed.
  it.skip('should disable the password input if the user does not have permission to create linodes', async () => {
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
      component: <Security />,
    });

    const rootPasswordInput = await findByLabelText('Root Password');

    await waitFor(() => {
      expect(rootPasswordInput).toBeDisabled();
    });
  });

  // Skipping due to test flake
  it.skip('should disable ssh key selection if the user does not have permission to create linodes', async () => {
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
      component: <Security />,
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

  it('should show Linode disk encryption if the flag is on and the account has the capability', async () => {
    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json(
          accountFactory.build({ capabilities: ['Disk Encryption'] })
        );
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Security />,
      options: { flags: { linodeDiskEncryption: true } },
    });

    const heading = await findByText('Disk Encryption');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H3');
  });

  it('should disable disk encryption if the selected core region does not support it', async () => {
    const region = regionFactory.build({
      capabilities: [],
      site_type: 'core',
    });

    const account = accountFactory.build({ capabilities: ['Disk Encryption'] });

    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json(account);
      }),
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const {
      findByLabelText,
    } = renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
      component: <Security />,
      options: { flags: { linodeDiskEncryption: true } },
      useFormOptions: { defaultValues: { region: region.id } },
    });

    await findByLabelText(
      'Disk encryption is not available in the selected region. Select another region to use Disk Encryption.'
    );
  });

  it('should disable the disk encryption checkbox (but show it as enabled) if the selected region is a distributed region', async () => {
    const region = regionFactory.build({
      capabilities: ['Disk Encryption'],
      site_type: 'distributed',
    });

    const account = accountFactory.build({ capabilities: ['Disk Encryption'] });

    server.use(
      http.get('*/v4/account', () => {
        return HttpResponse.json(account);
      }),
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const {
      findByLabelText,
      getByLabelText,
    } = renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
      component: <Security />,
      options: { flags: { linodeDiskEncryption: true } },
      useFormOptions: { defaultValues: { region: region.id } },
    });

    await findByLabelText(
      'Distributed Compute Instances are encrypted. This setting can not be changed.'
    );

    const checkbox = getByLabelText('Encrypt Disk');

    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
  });
});
