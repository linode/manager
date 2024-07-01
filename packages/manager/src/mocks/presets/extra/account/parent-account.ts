import { http } from 'msw';

import {
  accountFactory,
  accountUserFactory,
  profileFactory,
} from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

import type { MockPreset } from 'src/mocks/types';

/**
 * Mocks account, profile, and user requests to simulate a Parent/Child parent account user.
 */
const mockParentAccount = () => {
  return [
    http.get('*/v4*/account', () => {
      return makeResponse(
        accountFactory.build({
          company: 'Parent Company',
        })
      );
    }),
    http.get('*/v4*/profile', () => {
      return makeResponse(
        profileFactory.build({
          user_type: 'parent',
          username: 'Parent Account User',
        })
      );
    }),
    http.get(`*/v4*/account/users/Parent Account User`, () => {
      return makeResponse(
        accountUserFactory.build({
          user_type: 'parent',
          username: 'Parent Account User',
        })
      );
    }),
  ];
};

export const parentAccountPreset: MockPreset = {
  desc: 'Mock a Parent/Child parent account user',
  group: 'Account',
  handlers: [mockParentAccount],
  id: 'parent-child-parent-account-user',
  label: 'Parent Account User',
};
