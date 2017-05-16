import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { TwoFactorModal } from '~/profile/components/TwoFactorModal';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { profile } from '@/data/profile';


describe('profile/components/TwoFactorModal', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.stub();

  it('confirm two factor called', async () => {
    const page = mount(
      <TwoFactorModal
        dispatch={dispatch}
        toggleTwoFactor={() => {}}
        secret={'qrCode'}
        profile={profile}
      />
    );

    page.instance().setState({ tfaCode: 'theCode' });

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() {} });
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => {
        const _dispatch = sinon.stub();
        fn(_dispatch, () => ({ api: { profile: {} } }));
        return expectRequest(_dispatch.firstCall.args[0], '/account/profile/tfa-enable-confirm', {
          method: 'POST',
          body: { tfa_code: 'theCode' },
        });
      },
    ], 2, [{ secret: '' }]);
  });
});
