// New file at `src/mocks/presets/extra/account/lkeEnterpriseEnabled.ts` or similar

import { http } from 'msw';

import { accountFactory } from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

const mockLkeEnabledCapability = () => {
  return [
    http.get('*/v4*/account', async ({ request }) => {
      return makeResponse(
        accountFactory.build({
          capabilities: [
            // Other account capabilities might be necessary here, too...
            // TODO Make a `defaultAccountCapabilities` factory.
            'Kubernetes',
            'Kubernetes Enterprise',
          ],
        })
      );
    }),
  ];
};

export const lkeEnterpriseEnabledPreset: MockPresetExtra = {
  desc: 'Mock account with LKE Enterprise capability',
  group: { id: 'Account', type: 'select' },
  handlers: [mockLkeEnabledCapability],
  id: 'account:lke-enterprise-enabled',
  label: 'LKE Enterprise Enabled',
};
