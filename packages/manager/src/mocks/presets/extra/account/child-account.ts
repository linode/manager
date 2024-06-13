import { http } from 'msw';

import { MockPreset } from 'src/mocks/mockPreset';
import {
  accountFactory,
  profileFactory,
  accountUserFactory,
} from 'src/factories';
import { makeResponse } from 'src/mocks/utilities/response';

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
          username: 'Parent Account User',
          user_type: 'proxy',
        })
      );
    }),
    http.get(`*/v4*/account/users/Parent Account User`, () => {
      return makeResponse(
        accountUserFactory.build({
          username: 'Parent Account User',
          user_type: 'proxy',
        })
      );
    }),
  ];
};

export const childAccountPreset: MockPreset = {
  label: 'Child Account Proxy User',
  id: 'parent-child-child-account-proxy-user',
  desc: 'Mock a Parent/Child child account proxy user',
  group: 'Account',
  handlers: [mockChildAccount],
};
