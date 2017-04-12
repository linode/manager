import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { expectRequest } from '@/common';
import { TwoFactorModal } from '~/profile/components/TwoFactorModal';

describe('profile/layouts/twofactormodal', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.stub();

  it('confirm two factor called', async () => {
    const page = shallow(
      <TwoFactorModal
        dispatch={dispatch}
        toggleTwoFactor={() => {}}
      />
    );

    page.instance().setState({ tfaCode: 'theCode' });

    dispatch.reset();
    await page.instance().twoFactorConfirm();
    expect(dispatch.callCount).to.equal(1);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/account/profile/tfa-enable-confirm', {
      method: 'POST',
      body: { 'tfa_code': 'theCode' },
    });
  });
});
