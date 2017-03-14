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

    const rows = page.find('.SecondaryTable-row');
    expect(rows.length).to.equal(Object.keys(allIps).length);
    rows.forEach(row => {
      const columns = row.find('.SecondaryTable-column');
      const ipColumn = columns.at(0);
      const [address] = ipColumn.text().split(' ');
      const ip = allIps[address];
      expect(columns.at(1).text()).to.equal(linodes.linodes[ip.linode_id].label);
    });
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
