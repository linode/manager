import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { CreateOrEditApplication } from '~/profile/components';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';


describe('profile/components/CreateOrEditApplication', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('updates an application', async () => {
    const close = sandbox.spy();
    const page = shallow(
      <CreateOrEditApplication
        dispatch={dispatch}
        close={close}
        label="My awesome client"
        redirect_uri="http://example.com"
        id="1"
      />
    );

    const changeInput = (id, value) =>
      page.find('Input').find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('label', 'My new client');
    changeInput('redirect', 'http://google.com');

    await page.props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/clients/1', {
        method: 'PUT',
        body: {
          label: 'My new client',
          redirect_uri: 'http://google.com',
        },
      }),
    ], 1, [{ id: 1 }]);

    expect(close.callCount).to.equal(1);
  });
});
