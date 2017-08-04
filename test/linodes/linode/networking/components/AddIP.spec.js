import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import AddIP from '~/linodes/linode/networking/components/AddIP';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/networking/components/AddIP', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('submits data onsubmit and closes modal', async () => {
    const page = mount(
      <AddIP
        linode={testLinode}
        dispatch={dispatch}
        close={dispatch}
      />
    );

    changeInput(page, 'type', 'private', { displayName: 'Radio', nameOnly: true });

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() {} });

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/${testLinode.id}/ips`, {
        method: 'POST',
        body: { type: 'private' },
      }, { address: '192.168.1.1' }),
    ]);
  });
});
