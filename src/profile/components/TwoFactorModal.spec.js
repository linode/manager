import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { TwoFactorModal } from '~/profile/components/TwoFactorModal';

import { expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { profile } from '~/data/profile';


describe('profile/components/TwoFactorModal', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.stub();

  it('confirm two factor called', async () => {
    const page = mount(
      <TwoFactorModal
        dispatch={dispatch}
        secret={'qrCode'}
        username={profile.username}
      />
    );

    page.instance().setState({ tfaCode: 'theCode' });

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() { } });
    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/profile/tfa-enable-confirm', {
        method: 'POST',
        body: { tfa_code: 'theCode' },
      }),
    ], 2, [{ secret: '' }]);
  });
});
