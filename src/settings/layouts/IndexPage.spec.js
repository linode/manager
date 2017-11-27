import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { IndexPage } from '~/settings/layouts/IndexPage';

import { changeInput, expectRequest, expectDispatchOrStoreErrors } from '~/test.helpers';
import { account } from '~/data/account';


describe('settings/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('submit network helper', async () => {
    const dispatch = sandbox.stub();

    const page = mount(
      <IndexPage
        dispatch={dispatch}
        account={account}
      />
    );

    const helper = page.find('input[name="networkHelper"]').at(1);
    changeInput(helper, 'networkHelper', 'ON');

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/settings', {
        method: 'PUT',
        body: { network_helper: true },
      }),
    ]);
  });
});
