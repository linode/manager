import { waitFor } from '@testing-library/react';
import React from 'react';

import {
  accountSettingsFactory,
  profileFactory,
  regionFactory,
} from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Backups } from './Backups';

import type { CreateLinodeRequest } from '@linode/api-v4';

describe('Linode Create V2 Backups Addon', () => {
  it('should render a label and checkbox', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Backups />,
    });

    const checkbox = getByLabelText('Backups', { exact: false });

    expect(checkbox).toBeEnabled();
    expect(checkbox).not.toBeChecked();
  });

  it('should get its value from the form context', () => {
    const {
      getByRole,
    } = renderWithThemeAndHookFormContext<CreateLinodeRequest>({
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

  it('should be disabled if an edge region is selected', async () => {
    const region = regionFactory.build({ site_type: 'edge' });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const {
      getByRole,
    } = renderWithThemeAndHookFormContext<CreateLinodeRequest>({
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

    const {
      getByRole,
    } = renderWithThemeAndHookFormContext<CreateLinodeRequest>({
      component: <Backups />,
    });

    const checkbox = getByRole('checkbox');

    await waitFor(() => {
      expect(checkbox).toBeDisabled();
    });
  });
});
