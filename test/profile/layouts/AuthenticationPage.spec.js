import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { expectRequest } from '@/common';
import { AuthenticationPage } from '~/profile/layouts/AuthenticationPage';

describe('profile/layouts/AuthenticationPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('change password', async () => {
    const page = mount(
      <AuthenticationPage
        dispatch={dispatch}
      />
    );

    expect(page.find('option').length).to.equal(4);

    page.instance().setState({ password: 'thePassword' });
    await page.instance().passwordOnSubmit();
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];

    await expectRequest(fn, '/account/profile/password', undefined, undefined, {
      method: 'POST',
      body: { password: 'thePassword', expires: null },
    });
  });
});
