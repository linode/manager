import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import AddIP from '~/linodes/linode/networking/components/AddIP';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';
import { state } from '@/data';


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

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('type', 'private');

    dispatch.reset();
    await page.find('Form').props().onSubmit({ preventDefault() {} });

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      async function ([fn]) {
        const _dispatch = sinon.stub();
        _dispatch.returns({ address: '192.168.1.1' });
        await fn(_dispatch, () => state);

        expect(_dispatch.callCount).to.equal(2);

        await expectRequest(
          _dispatch.firstCall.args[0],
          `/linode/instances/${testLinode.id}/ips`,
          {
            method: 'POST',
            body: { type: 'private' },
          });
      },
    ]);
  });
});
