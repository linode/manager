import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { profile } from '@/data/profile';

import { expectRequest } from '@/common';
import { TwoFactorPanel } from '~/profile/components/TwoFactorPanel';

describe('profile/layouts/twofactorpanel', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.stub();

  const profile2 = {
    ...profile,
    two_factor_auth: 'disabled',
  };

  it('disable two factor called', async () => {
    const page = shallow(
      <TwoFactorPanel
        dispatch={dispatch}
        profile={profile}
      />
    );

    const button = page.find('SubmitButton').at(0);
    expect(button.props().children).to.equal('Disable');

    await page.instance().twoFactorAction();
    expect(dispatch.callCount).to.equal(1);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/account/profile/tfa-disable', {
      method: 'POST',
    });
  });

  it('enable two factor called', async () => {
    const page = shallow(
      <TwoFactorPanel
        dispatch={dispatch}
        profile={profile2}
      />
    );

    const button = page.find('SubmitButton').at(0);
    expect(button.props().children).to.equal('Enable');

    dispatch.reset();
    await page.instance().twoFactorAction();
    expect(dispatch.callCount).to.equal(1);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/account/profile/tfa-enable', {
      method: 'POST',
    });
  });
});
