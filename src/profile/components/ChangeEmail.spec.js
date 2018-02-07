import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ChangeEmail } from '~/profile/components';

import {
  createSimulatedEvent,
  expectRequest,
  expectDispatchOrStoreErrors,
} from '~/test.helpers';
import { profile } from '~/data/profile';


describe('profile/components/ChangeEmail', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('changes email', async () => {
    const dispatch = sandbox.stub();
    const page = mount(
      <ChangeEmail
        dispatch={dispatch}
        email={profile.email}
      />
    );

    page.find('input[name="email"]')
      .simulate('change', createSimulatedEvent('email', 'new@gmail.com'));

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/profile', {
        method: 'PUT',
        body: { email: 'new@gmail.com' },
      }),
    ]);
  });
});
