import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { TwoFactor } from '~/profile/components';

import { expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';


describe('profile/components/TwoFactor', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.stub();

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <TwoFactor
        dispatch={dispatch}
        tfaEnabled
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('disable two factor called', async () => {
    const page = shallow(
      <TwoFactor
        dispatch={dispatch}
        tfaEnabled
      />
    );

    const button = page.find('SubmitButton').at(0);
    expect(button.props().children).toBe('Disable');

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() { } });
    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/profile/tfa-disable', {
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
    expect(button.props().children).toBe('Enable');

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() { } });
    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/profile/tfa-enable', {
        method: 'POST',
      }),
    ], 1, [{ secret: '' }]);
  });
});
