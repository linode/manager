import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ChangeTimezone } from '~/profile/components';

import { profile } from '@/data/profile';
import { expectRequest, expectDispatchOrStoreErrors } from '@/common';


describe('profile/components/ChangeTimezone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('changes email', async () => {
    const dispatch = sandbox.stub();
    const page = mount(
      <ChangeTimezone
        dispatch={dispatch}
        timezone={profile.timezone}
      />
    );

    const changeInput = (id, value) =>
      page.find({ id, name: id }).simulate('change', { target: { value, name: id } });

    changeInput('timezone', 'GMT');

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/profile', {
        method: 'PUT',
        body: { timezone: 'GMT' },
      }),
    ]);
  });
});
