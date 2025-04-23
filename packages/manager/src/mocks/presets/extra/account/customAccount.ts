import { http } from 'msw';

import { accountFactory } from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

import type { Account } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

let customAccountData: Account | null = null;

export const setCustomAccountData = (data: Account | null) => {
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
