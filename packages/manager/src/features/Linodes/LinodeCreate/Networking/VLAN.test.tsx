import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VLAN } from './VLAN';

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

describe('VLAN', () => {
  it('Should disable a VLAN select if the user does not have create_linode permission', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <VLAN index={0} />,
    });

    expect(getByLabelText('VLAN')).toBeInTheDocument();
    expect(getByLabelText('VLAN')).toBeDisabled();
  });
  it('Should disable a IPAM Address input if the user does not have create_linode permission', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <VLAN index={0} />,
    });

    expect(getByLabelText('IPAM Address (optional)')).toBeInTheDocument();
    expect(getByLabelText('IPAM Address (optional)')).toBeDisabled();
  });
  it('Should render a VLAN select and IPAM Address input that are enabled when a compatible region is selected and an image is selected, and user has create_linode permission', async () => {
    const region = regionFactory.build({ capabilities: ['Vlans'] });

    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
    server.use(
      http.get(`*/v4*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <VLAN index={0} />,
      useFormOptions: {
        defaultValues: { image: 'fake-image', region: region.id },
      },
    });

    const vlanSelect = getByLabelText('VLAN');
    const ipamAddressInput = getByLabelText('IPAM Address (optional)');

    await waitFor(() => {
      expect(vlanSelect).toBeEnabled();
      expect(ipamAddressInput).toBeEnabled();
    });
  });
});
