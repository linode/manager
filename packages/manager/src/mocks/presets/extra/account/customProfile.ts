import { grantsFactory, profileFactory } from '@linode/utilities';
import { http } from 'msw';

import { makeResponse } from 'src/mocks/utilities/response';

import type { Grants, Profile } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

let customProfileData: null | Profile = null;
let customGrantsData: Grants | null = null;

export const setCustomProfileData = (data: null | Profile) => {
  customProfileData = data;
};

export const setCustomGrantData = (data: Grants | null) => {
  customGrantsData = data;
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
  desc: 'Custom Profile',
  group: { id: 'Profile', type: 'profile' },
  handlers: [mockCustomProfile, mockCustomGrants],
  id: 'profile:custom',
  label: 'Custom Profile',
};
