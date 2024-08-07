import { http } from 'msw';

import {
  accountFactory,
  accountUserFactory,
  profileFactory,
} from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

import type { MockPresetExtra } from 'src/mocks/types';

/**
 * Mocks account, profile, and user requests to simulate a Parent/Child child account user.
 */
const mockChildAccount = () => {
  return [
    http.get('*/v4*/account', () => {
      return makeResponse(
        accountFactory.build({
          company: 'Partner Company',
        })
      );
    }),
    http.get('*/v4*/profile', () => {
      return makeResponse(
        profileFactory.build({
          user_type: 'proxy',
          username: 'Parent Account User',
        })
      );
    }),
    http.get(`*/v4*/account/users/Parent Account User`, () => {
      return makeResponse(
        accountUserFactory.build({
          user_type: 'proxy',
          username: 'Parent Account User',
        })
      );
    }),
  ];
};

export const childAccountPreset: MockPresetExtra = {
  desc: 'Mock a Parent/Child child account proxy user',
  group: { id: 'Account', type: 'single' },
  handlers: [mockChildAccount],
  id: 'parent-child-account:child-proxy',
  label: 'Child Account Proxy User',
};
