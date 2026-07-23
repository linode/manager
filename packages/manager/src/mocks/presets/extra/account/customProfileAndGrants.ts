import {
  grantsFactory,
  profileFactory,
  securityQuestionsFactory,
} from '@linode/utilities';
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

const answeredSecurityQuestions = securityQuestionsFactory.build({
  security_questions: [
    {
      id: 1,
      question: 'In what city were you born?',
      response: 'Springfield',
    },
    {
      id: 2,
      question: 'What is the name of your oldest sibling?',
      response: 'Alex',
    },
    {
      id: 3,
      question: 'What was the first concert you attended?',
      response: 'Rock Fest',
    },
  ],
});

const mockAnsweredSecurityQuestions = () => {
  const handler = () => makeResponse(answeredSecurityQuestions);

  return [
    http.get('*/v4*/profile/security-questions', handler),
    http.get('*/profile/security-questions', handler),
  ];
};

const mockTfaToken = () => {
  const handler = () =>
    makeResponse({
      expiry: new Date(Date.now() + 1000 * 60 * 10),
      secret: 'JBSWY3DPEHPK3PXP',
    });

  return [
    http.post('*/v4*/profile/tfa-enable', handler),
    http.post('*/profile/tfa-enable', handler),
  ];
};

export const customProfileAndGrantsPreset: MockPresetExtra = {
  desc: 'Custom Profile and Grants',
  group: { id: 'Profile & Grants', type: 'profile & grants' },
  handlers: [
    mockCustomProfile,
    mockCustomGrants,
    mockAnsweredSecurityQuestions,
    mockTfaToken,
  ],
  id: 'profile-grants:custom',
  label: 'Custom Profile and Grants',
};
