import { http } from 'msw';
import { accountSettingsFactory } from 'src/factories';

import { MockPreset } from 'src/mocks/mockPreset';
import { makeResponse } from 'src/mocks/utilities/response';

const mockManagedDisabledAccount = () => {
  return [
    http.get('*/v4*/account/settings', () => {
      return makeResponse(
        accountSettingsFactory.build({
          managed: false,
        })
      );
    }),
  ];
};

export const managedDisabledPreset: MockPreset = {
  label: 'Managed Disabled',
  id: 'account-managed-disabled',
  desc: 'Mock account settings to disable Linode Managed',
  group: 'Account',
  handlers: [mockManagedDisabledAccount],
};
