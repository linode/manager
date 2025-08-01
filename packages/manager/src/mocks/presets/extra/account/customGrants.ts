import { grantsFactory } from '@linode/utilities';
import { http } from 'msw';

import { makeResponse } from 'src/mocks/utilities/response';

import type { Grants } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

let customGrantsData: Grants | null = null;

export const setCustomGrantData = (data: Grants | null) => {
  customGrantsData = data;
};

const mockCustomGrants = () => {
  return [
    http.get('*/v4*/grants', async () => {
      return makeResponse(
        customGrantsData
          ? { ...grantsFactory.build(), ...customGrantsData }
          : grantsFactory.build()
      );
    }),
  ];
};

export const customProfilePreset: MockPresetExtra = {
  desc: 'Custom Grants',
  group: { id: 'Grants', type: 'grants' },
  handlers: [mockCustomGrants],
  id: 'grants:custom',
  label: 'Custom Grants',
};
