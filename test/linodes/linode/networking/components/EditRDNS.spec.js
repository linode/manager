import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditRDNS from '~/linodes/linode/networking/components/EditRDNS';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { state } from '@/data';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/networking/components/EditRDNS', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();
  const ip = Object.values(testLinode._ips).filter(
    ip => ip.type === 'public' && ip.version === 'ipv4')[0];

  it('renders fields correctly', () => {
    const page = mount(
      <EditRDNS
        dispatch={dispatch}
        close={() => {}}
        ip={ip}
      />
    );

    const address = page.find('#address');
    expect(address.props().value).to.equal(ip.address);

    const hostname = page.find('#hostname');
    expect(hostname.props().value).to.equal(ip.rdns);
  });

  it('submits data onsubmit and closes modal', async () => {
    const page = mount(
      <EditRDNS
        dispatch={dispatch}
        close={dispatch}
        ip={ip}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('hostname', 'test.com');

    await page.find('Form').props().onSubmit({ preventDefault() {} });

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      async function ([fn]) {
        const _dispatch = sinon.stub();
        _dispatch.returns({ rdns: '' });
        await fn(_dispatch, () => state);

        expect(_dispatch.callCount).to.equal(2);

        await expectRequest(
          _dispatch.firstCall.args[0],
          `/linode/instances/${testLinode.id}/ips/${ip.address}`,
          {
            method: 'PUT',
            body: { rdns: 'test.com' },
          });
      },
    ]);
  });
});
