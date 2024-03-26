import { waitFor } from '@testing-library/react';
import React from 'react';

import { accountSettingsFactory, regionFactory } from 'src/factories';
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

  it('should get its value from the from context', () => {
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
});
