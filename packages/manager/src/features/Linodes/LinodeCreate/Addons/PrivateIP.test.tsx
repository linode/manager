import { waitFor } from '@testing-library/react';
import React from 'react';

import { profileFactory, regionFactory } from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { PrivateIP } from './PrivateIP';

import type { CreateLinodeRequest } from '@linode/api-v4';

describe('Linode Create Private IP Add-on', () => {
  it('should render a label and checkbox', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <PrivateIP />,
    });

    const checkbox = getByLabelText('Private IP', { exact: false });

    expect(checkbox).toBeEnabled();
    expect(checkbox).not.toBeChecked();
  });

  it('should get its value from the form context', () => {
    const {
      getByRole,
    } = renderWithThemeAndHookFormContext<CreateLinodeRequest>({
      component: <PrivateIP />,
      useFormOptions: { defaultValues: { private_ip: true } },
    });

    const checkbox = getByRole('checkbox');

    expect(checkbox).toBeEnabled();
    expect(checkbox).toBeChecked();
  });

  it('should be disabled if a distributed region is selected', async () => {
    const region = regionFactory.build({ site_type: 'distributed' });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const {
      getByRole,
    } = renderWithThemeAndHookFormContext<CreateLinodeRequest>({
      component: <PrivateIP />,
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
      component: <PrivateIP />,
    });

    const checkbox = getByRole('checkbox');

    await waitFor(() => {
      expect(checkbox).toBeDisabled();
    });
  });
});
