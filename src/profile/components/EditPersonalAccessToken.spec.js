import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditPersonalAccessToken from '~/profile/components/EditPersonalAccessToken';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testToken } from '~/data/tokens';


describe('profile/components/EditPersonalAccessToken', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <EditPersonalAccessToken
        dispatch={dispatch}
        close={close}
        label={testToken.label}
        id={testToken.id}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('modifies a token', async () => {
    const close = sandbox.spy();
    const page = shallow(
      <EditPersonalAccessToken
        dispatch={dispatch}
        close={close}
        label={testToken.label}
        id={testToken.id}
      />
    );

    changeInput(page, 'label', 'My awesome token');

    await page.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/profile/tokens/${testToken.id}`, {
        method: 'PUT',
        body: {
          label: 'My awesome token',
        },
      }),
    ], 1);

    expect(close.callCount).toBe(1);
  });
});
