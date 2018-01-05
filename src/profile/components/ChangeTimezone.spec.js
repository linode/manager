import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ChangeTimezone } from '~/profile/components';

import {
  createSimulatedEvent,
  expectRequest,
  expectDispatchOrStoreErrors,
} from '~/test.helpers';
import { profile } from '~/data/profile';


describe('profile/components/ChangeTimezone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <ChangeTimezone
        dispatch={dispatch}
        timezone={profile.timezone}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('changes email', async () => {
    const dispatch = sandbox.stub();
    const page = mount(
      <ChangeTimezone
        dispatch={dispatch}
        timezone={profile.timezone}
      />
    );

    page.find('select[name="timezone"]')
      .simulate('change', createSimulatedEvent('timezone', 'GMT'));

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
