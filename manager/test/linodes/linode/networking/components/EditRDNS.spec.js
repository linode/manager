import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common';
import EditRDNS from '~/linodes/linode/networking/components/EditRDNS';

describe('linodes/linode/networking/components/EditRDNS', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();
  const ip = testLinode._ips.ipv4.public[0];

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

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(2);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/linode/instances/${testLinode.id}/ips/${ip.address}`, {
      method: 'PUT',
      body: { rdns: 'test.com' },
    });
  });
});
