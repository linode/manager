import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { IPSharingPage } from '~/linodes/linode/networking/layouts/IPSharingPage';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';
import { state } from '@/data';


const { linodes } = state.api.linodes;

describe('linodes/linode/networking/layouts/IPSharingPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  const linodesInRegion = Object.values(linodes).filter(
    l => l.region.id === testLinode.region.id);

  const allIps = {};
  linodesInRegion.forEach(linode => {
    if (linode.id !== testLinode.id) {
      const publicIPv4s = Object.values(linode._ips).filter(
        ip => ip.type === 'public' && ip.version === 'ipv4');

      publicIPv4s.forEach(ip => {
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
      <IPSharingPage
        dispatch={dispatch}
        linodes={linodes}
        linode={testLinode}
      />
    );

    const rows = page.find('.TableRow');
    expect(rows.length).to.equal(Object.keys(allIps).length);
  });

  it('saves shared ips', async () => {
    const page = mount(
      <IPSharingPage
        dispatch={dispatch}
        linodes={linodes}
        linode={testLinode}
      />
    );

    const someIP = Object.values(linodesInRegion[0]._ips).filter(
      ({ version, type }) => type === 'public' && version === 'ipv4')[0];
    page.instance().setState({ checked: { [someIP.address]: true } });

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/${testLinode.id}/ips/sharing`, {
        method: 'POST',
        body: { ips: [someIP.address] },
      }),
    ]);
  });
});
