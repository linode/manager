import { profileFactory, regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Backups } from './Backups';

import type { LinodeCreateFormValues } from '../utilities';

describe('Linode Create Backups Addon', () => {
  it('should render a label and checkbox', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Backups />,
    });

    const checkbox = getByLabelText('Backups', { exact: false });

    expect(checkbox).toBeEnabled();
    expect(checkbox).not.toBeChecked();
  });

  it('should get its value from the form context', () => {
    const { getByRole } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <Backups />,
        useFormOptions: { defaultValues: { backups_enabled: true } },
      });

    const checkbox = getByRole('checkbox');

    expect(checkbox).toBeEnabled();
    expect(checkbox).toBeChecked();
  });

  it('should render special copy, be checked, and be disabled if account backups are enabled', async () => {
    server.use(
      http.get('*/v4/account/settings', () => {
        return HttpResponse.json(
          accountSettingsFactory.build({ backups_enabled: true })
        );
      })
    );

    const { findByText, getByRole } = renderWithThemeAndHookFormContext({
      component: <Backups />,
    });

    const checkbox = getByRole('checkbox');

    await findByText('You have enabled automatic backups for your account.', {
      exact: false,
    });

    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
  });

  it('should be disabled if a distributed region is selected', async () => {
    const region = regionFactory.build({ site_type: 'distributed' });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { getByRole } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <Backups />,
        useFormOptions: { defaultValues: { region: region.id } },
      });

    const checkbox = getByRole('checkbox');

    await waitFor(() => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('should be disabled if the user does not have permission to create a linode', async () => {
    server.use(
      http.get('*/v4/profile', () => {
        return HttpResponse.json(profileFactory.build({ restricted: true }));
      }),
      http.get('*/v4/profile/grants', () => {
        return HttpResponse.json(
          grantsFactory.build({ global: { add_linodes: false } })
        );
      })
    );

    const { getByRole } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <Backups />,
      });

    const checkbox = getByRole('checkbox');

    await waitFor(() => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('renders a warning if disk encryption is enabled and backups are enabled', async () => {
    const { getByText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <Backups />,
        useFormOptions: {
          defaultValues: { backups_enabled: true, disk_encryption: 'enabled' },
        },
      });

    expect(
      getByText('Virtual Machine Backups are not encrypted.')
    ).toBeVisible();
  });
});
