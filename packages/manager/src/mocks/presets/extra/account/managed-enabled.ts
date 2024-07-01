import { http } from 'msw';

import { accountSettingsFactory } from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

import type { MockPreset } from 'src/mocks/types';

const mockManagedEnabledAccount = () => {
  return [
    http.get('*/v4*/account/settings', () => {
      return makeResponse(
        accountSettingsFactory.build({
          managed: true,
        })
      );
    }),
  ];
};

export const managedEnabledPreset: MockPreset = {
  desc: 'Mock account settings to enable Linode Managed',
  group: 'Account',
  handlers: [mockManagedEnabledAccount],
  id: 'account-managed-enabled',
  label: 'Managed Enabled',
};
