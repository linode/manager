import { accountCapabilities } from '@linode/api-v4';
import { http } from 'msw';

import { accountFactory } from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

import type { AccountCapability } from '@linode/api-v4';
import type { MockPresetExtraAccountId } from 'src/mocks/types';

const mockAccountCapabilities = (
  capability: AccountCapability
): MockPresetExtraAccountId => {
  const mockAccountCapabilities = () => {
    return [
      http.get('*/v4*/account', async () => {
        return makeResponse(
          accountFactory.build({ capabilities: [capability] })
        );
      }),
    ];
  };

  return {
    desc: `${capability} capability`,
    group: { id: 'Capabilities', type: 'checkbox' },
    handlers: [mockAccountCapabilities],
    id: `capabilities:${capability}`,
    initialSelected: true,
    label: capability,
    removeSeparator: true,
  };
};

export const accountCapabilitiesPresets = accountCapabilities.map(
  mockAccountCapabilities
);
