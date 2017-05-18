import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import IPSharing from '~/linodes/linode/networking/components/IPSharing';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';
import { state } from '@/data';


const { linodes } = state.api;

describe('linodes/linode/networking/components/IPSharing', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  const linodesInRegion = Object.values(linodes.linodes).filter(
    l => l.region.id === testLinode.region.id);

  const allIps = {};
  linodesInRegion.forEach(linode => {
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
        linodes={linodesInRegion}
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
        linodes={linodesInRegion}
        linode={testLinode}
      />
    );

    const someIp = Object.values(allIps)[0];
    page.instance().setState({ checked: { [someIp.address]: true } });

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/${testLinode.id}/ips/sharing`, {
        method: 'POST',
        body: { ips: [someIp.address] },
      }),
    ]);
  });
});
