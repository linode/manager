import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { LishPage } from '~/profile/layouts/LishPage';

import { changeInput, expectRequest, expectDispatchOrStoreErrors } from '@/common';
import { profile } from '@/data/profile';


describe('profile/layouts/LishPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('changes lish settings', async () => {
    const dispatch = sandbox.stub();

    const page = mount(
      <LishPage
        dispatch={dispatch}
        profile={profile}
      />
    );

    changeInput(page, 'authorization', 'disabled');
    changeInput(page, 'keys', 'foobar\nbarfoo');

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/profile', {
        method: 'PUT',
        body: {
          lish_auth_method: 'disabled',
          authorized_keys: ['foobar', 'barfoo'],
        },
      }),
    ], 1);
  });
});
