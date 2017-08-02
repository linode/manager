import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import TakeSnapshot from '~/linodes/linode/backups/components/TakeSnapshot';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/backups/components/TakeSnapshot', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('should dispatch a snapshot request', async () => {
    const page = mount(
      <TakeSnapshot
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() {} });

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/backups', { method: 'POST' }),
    ], 1);
  });
});
