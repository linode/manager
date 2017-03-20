import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import IPSharing from '~/linodes/linode/networking/components/IPSharing';
import { testLinode } from '@/data/linodes';
import { state } from '@/data';
import { expectRequest } from '@/common';

const { linodes } = state.api;

describe('linodes/linode/networking/components/IPSharing', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  const linodesInDatacenter = Object.values(linodes.linodes).filter(
    l => l.datacenter.id === testLinode.datacenter.id);

  const allIps = {};
  linodesInDatacenter.forEach(linode => {
    if (linode.id !== testLinode.id) {
      linode._ips.ipv4.public.forEach(ip => {
        allIps[ip.address] = ip;
      });
    }
  });

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders ips', () => {
    const page = mount(
      <IPSharing
        dispatch={dispatch}
        linodes={linodesInDatacenter}
        linode={testLinode}
      />
    );

    const rows = page.find('.TableRow');
    expect(rows.length).to.equal(Object.keys(allIps).length);
  });

  it('saves shared ips', async () => {
    const page = mount(
      <IPSharing
        dispatch={dispatch}
        linodes={linodesInDatacenter}
        linode={testLinode}
      />
    );

    const someIp = Object.values(allIps)[0];
    page.instance().setState({ checked: { [someIp.address]: true } });

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/linode/instances/${testLinode.id}/ips/sharing`, {
      method: 'POST',
      body: { ips: [someIp.address] },
    });
  });
});
