import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { PrivateIP } from './PrivateIP';

import type { CreateLinodeRequest } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('Linode Create Private IP Add-on', () => {
  it('should render a label and checkbox', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <PrivateIP />,
    });

    const checkbox = getByLabelText('Private IP', { exact: false });

    expect(checkbox).not.toBeChecked();
  });

  it('should be disabled if the user does not have create_linode permission', async () => {
    const { getByRole } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <PrivateIP />,
      });

    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('should be enabled if the user has create_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
    const { getByRole } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <PrivateIP />,
      });

    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeEnabled();
  });

  it('should get its value from the form context', () => {
    const { getByRole } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
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
      http.get('*/v4*/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { getByRole } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <PrivateIP />,
        useFormOptions: { defaultValues: { region: region.id } },
      });

    const checkbox = getByRole('checkbox');

    await waitFor(() => {
      expect(checkbox).toBeDisabled();
    });
  });
});
