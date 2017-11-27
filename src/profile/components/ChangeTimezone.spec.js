import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ChangeTimezone } from '~/profile/components';

import { changeInput, expectRequest, expectDispatchOrStoreErrors } from '~/test.helpers';
import { profile } from '~/data/profile';


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

    changeInput(page, 'timezone', 'GMT');

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/profile', {
        method: 'PUT',
        body: { timezone: 'GMT' },
      }),
    ]);
  });
});
