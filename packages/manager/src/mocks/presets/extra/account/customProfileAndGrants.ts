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

export const setCustomGrantsData = (data: Grants | null) => {
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

export const customProfileAndGrantsPreset: MockPresetExtra = {
  desc: 'Custom Profile and Grants',
  group: { id: 'Profile & Grants', type: 'profile & grants' },
  handlers: [mockCustomProfile, mockCustomGrants],
  id: 'profile-grants:custom',
  label: 'Custom Profile and Grants',
};
