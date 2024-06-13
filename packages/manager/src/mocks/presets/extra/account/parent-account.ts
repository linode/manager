import { http } from 'msw';

import { MockPreset } from 'src/mocks/mockPreset';
import {
  accountFactory,
  profileFactory,
  accountUserFactory,
} from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

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
          username: 'Parent Account User',
          user_type: 'parent',
        })
      );
    }),
    http.get(`*/v4*/account/users/Parent Account User`, () => {
      return makeResponse(
        accountUserFactory.build({
          username: 'Parent Account User',
          user_type: 'parent',
        })
      );
    }),
  ];
};

export const parentAccountPreset: MockPreset = {
  label: 'Parent Account User',
  id: 'parent-child-parent-account-user',
  desc: 'Mock a Parent/Child parent account user',
  group: 'Account',
  handlers: [mockParentAccount],
};
