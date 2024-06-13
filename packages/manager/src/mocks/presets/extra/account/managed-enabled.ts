import { http } from 'msw';
import { accountSettingsFactory } from 'src/factories';

import { MockPreset } from 'src/mocks/mockPreset';
import { makeResponse } from 'src/mocks/utilities/response';

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
  label: 'Managed Enabled',
  id: 'account-managed-enabled',
  desc: 'Mock account settings to enable Linode Managed',
  group: 'Account',
  handlers: [mockManagedEnabledAccount],
};
