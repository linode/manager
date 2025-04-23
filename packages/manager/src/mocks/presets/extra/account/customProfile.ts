import { profileFactory } from '@linode/utilities';
import { http } from 'msw';

import { makeResponse } from 'src/mocks/utilities/response';

import type { Profile } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

let customProfileData: Profile | null = null;

export const setCustomProfileData = (data: Profile | null) => {
  customProfileData = data;
};

const mockCustomProfile = () => {
  return [
    http.get('*/v4*/profile', async () => {
      return makeResponse(
        customProfileData
          ? { ...profileFactory.build(), ...customProfileData }
          : profileFactory.build()
      );
    }),
  ];
};

export const customProfilePreset: MockPresetExtra = {
  desc: 'Custom Profile',
  group: { id: 'Profile', type: 'profile' },
  handlers: [mockCustomProfile],
  id: 'profile:custom',
  label: 'Custom Profile',
};
