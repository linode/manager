import { http } from 'msw';

import { accountFactory } from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

let customAccountData: Record<string, any> | null = null;

// Expose a way to update the mock data
export const setCustomAccountData = (data: Record<string, any> | null) => {
  customAccountData = data;
};

const mockCustomAccount = () => {
  return [
    http.get('*/v4*/account', async () => {
      return makeResponse(
        customAccountData
          ? { ...accountFactory.build(), ...customAccountData }
          : accountFactory.build()
      );
    }),
  ];
};

export const customAccountPreset: MockPresetExtra = {
  desc: 'Custom Account',
  group: { id: 'Account', type: 'account' },
  handlers: [mockCustomAccount],
  id: 'account:custom',
  label: 'Custom Account',
};
