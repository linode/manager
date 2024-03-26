import { waitFor } from '@testing-library/react';
import React from 'react';

import { regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { PrivateIP } from './PrivateIP';

import type { CreateLinodeRequest } from '@linode/api-v4';

describe('Linode Create V2 Private IP Add-on', () => {
  it('should render a label and checkbox', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <PrivateIP />,
    });

    const checkbox = getByLabelText('Private IP', { exact: false });

    expect(checkbox).toBeEnabled();
    expect(checkbox).not.toBeChecked();
  });

  it('should get its value from the from context', () => {
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
      component: <PrivateIP />,
      useFormOptions: { defaultValues: { region: region.id } },
    });

    const checkbox = getByRole('checkbox');

    await waitFor(() => {
      expect(checkbox).toBeDisabled();
    });
  });
});
