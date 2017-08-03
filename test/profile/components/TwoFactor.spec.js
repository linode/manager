import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { TwoFactor } from '~/profile/components';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';


describe('profile/components/TwoFactor', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.stub();

  it('disable two factor called', async () => {
    const page = shallow(
      <TwoFactor
        dispatch={dispatch}
        tfaEnabled
      />
    );

    const button = page.find('SubmitButton').at(0);
    expect(button.props().children).to.equal('Disable');

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() {} });
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/profile/tfa-disable', {
        method: 'POST',
      }),
    ], 1);
  });

  it('enable two factor called', async () => {
    const page = shallow(
      <TwoFactor
        dispatch={dispatch}
        tfaEnabled={false}
      />
    );

    const button = page.find('SubmitButton').at(0);
    expect(button.props().children).to.equal('Enable');

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() {} });
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/profile/tfa-enable', {
        method: 'POST',
      }),
    ], 1, [{ secret: '' }]);
  });
});
