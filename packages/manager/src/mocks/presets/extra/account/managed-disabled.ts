import { http } from 'msw';

import { accountSettingsFactory } from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

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

export const managedDisabledPreset: MockPresetExtra = {
  desc: 'Mock account settings to disable Linode Managed',
  group: { id: 'Managed', type: 'select' },
  handlers: [mockManagedDisabledAccount],
  id: 'account:managed-disabled',
  label: 'Managed Disabled',
};
