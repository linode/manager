import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { IndexPage } from '~/settings/layouts/IndexPage';

import { expectRequest, expectDispatchOrStoreErrors } from '@/common';
import { account } from '@/data/account';


describe('settings/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('submit network helper', async () => {
    const dispatch = sinon.stub();

    const page = mount(
      <IndexPage
        dispatch={dispatch}
        account={account}
      />
    );

    page.find('#networkHelper').simulate('change');

    dispatch.reset();
    await page.find('Form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/settings', {
        method: 'PUT',
        body: { network_helper: true },
      }),
    ]);
  });
});
