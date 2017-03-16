import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { expectRequest } from '@/common';
import { AuthenticationPage } from '~/profile/layouts/AuthenticationPage';

describe('profile/layouts/AuthenticationPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

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
});
