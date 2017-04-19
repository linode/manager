import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { expectRequest } from '@/common';
import { AuthenticationPage } from '~/profile/layouts/AuthenticationPage';

describe('profile/layouts/authenticationpage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.stub();

  it('changes password', async () => {
    const page = shallow(
      <AuthenticationPage
        dispatch={dispatch}
      />
    );

    page.instance().setState({ password: 'thePassword' });
    await page.instance().passwordOnSubmit();
    expect(dispatch.callCount).to.equal(1);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/account/profile/password', {
      method: 'POST',
      body: { password: 'thePassword' },
    });
  });

  it('renders two factor', async () => {
    const page = shallow(
      <AuthenticationPage
        dispatch={dispatch}
      />
    );

    expect(page.find('TwoFactorPanel').length).to.equal(1);
  });
});
