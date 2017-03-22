import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import _ from 'lodash';
import { push } from 'react-router-redux';

import IPTransfer from '~/linodes/linode/networking/components/IPTransfer';
import { testLinode } from '@/data/linodes';
import { state } from '@/data';
import { expectRequest, expectObjectDeepEquals } from '@/common';

const { linodes } = state.api;

describe('linodes/linode/networking/components/IPTransfer', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  const linodesInDatacenter = _.pickBy(linodes.linodes, l =>
      l.datacenter.id === testLinode.datacenter.id);

  const allIps = {};
  Object.values(linodesInDatacenter).forEach(linode => {
    linode._ips.ipv4.public.forEach(ip => {
      allIps[ip.address] = ip;
    });
  });

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders ips', () => {
    const page = mount(
      <IPTransfer
        dispatch={dispatch}
        linodes={linodesInDatacenter}
        linode={testLinode}
      />
    );

    const sectionA = page.find('#sectionA');
    const rowsA = sectionA.find('.TableRow');
    expect(rowsA.length).to.equal(testLinode._ips.ipv4.public.length);
    rowsA.forEach(row => {
      const address = row.find('.Table-cell').at(1).text();
      const ip = allIps[address.split(' ')[0]];
      expect(address).to.equal(`${ip.address} (${ip.rdns})`);
    });

    const sectionB = page.find('#sectionB');
    const linodeB = linodes.linodes[page.find('select').props().value];
    const rowsB = sectionB.find('.TableRow');
    expect(rowsB.length).to.equal(linodeB._ips.ipv4.public.length);
    rowsB.forEach(row => {
      const address = row.find('.Table-cell').at(1).text();
      const ip = allIps[address.split(' ')[0]];
      expect(address).to.equal(`${ip.address} (${ip.rdns})`);
    });
  });

  it('updates list of IPs when linodeB changes', () => {
    const page = mount(
      <IPTransfer
        dispatch={dispatch}
        linodes={linodesInDatacenter}
        linode={testLinode}
      />
    );

    const sectionB = page.find('#sectionB');
    const select = page.find('select');
    const linodeB = linodes.linodes[select.props().value];
    const notLinodeB = Object.values(linodesInDatacenter).filter(
      ({ id }) => id !== linodeB.id)[0];

    select.simulate('change', { record: { name: 'selectedOtherLinode', value: notLinodeB.id } });

    const rowsB = sectionB.find('.TableRow');
    expect(rowsB.length).to.equal(notLinodeB._ips.ipv4.public.length);
    rowsB.forEach(row => {
      const address = row.find('.Table-cell').at(1).text();
      const ip = allIps[address.split(' ')[0]];
      expect(address).to.equal(`${ip.address} (${ip.rdns})`);
    });
  });

  it('calls the API correctly', async () => {
    const page = mount(
      <IPTransfer
        dispatch={dispatch}
        linodes={linodesInDatacenter}
        linode={testLinode}
      />
    );


    const sectionAFirstIp = page.find('#sectionA .TableRow').at(0);
    const addressA = sectionAFirstIp.find('.Table-cell').at(1).text()
                                    .split(' ')[0];
    const ipA = allIps[addressA];
    const checkboxA = sectionAFirstIp.find('Checkbox');
    const checkboxAProps = checkboxA.props();
    checkboxAProps.onChange({ target: { checked: true } });

    const sectionBFirstIp = page.find('#sectionB .TableRow').at(0);
    const addressB = sectionBFirstIp.find('.Table-cell').at(1).text()
                                    .split(' ')[0];
    const ipB = allIps[addressB];
    const checkboxB = sectionBFirstIp.find('Checkbox');
    const checkboxBProps = checkboxB.props();
    checkboxBProps.onChange({ target: { checked: true } });

    await page.find('form').simulate('submit');

    expect(dispatch.callCount).to.equal(2);

    let fn = dispatch.getCall(0).args[0];
    await expectRequest(fn, '/networking/ip-assign', {
      method: 'POST',
      body: {
        datacenter: testLinode.datacenter.id,
        assignments: [
          { address: ipA.address, linode_id: ipB.linode_id },
          { address: ipB.address, linode_id: ipA.linode_id },
        ],
      },
    });

    fn = dispatch.getCall(1).args[0];
    await expectRequest(fn, `/linode/instances/${ipA.linode_id}`);

    fn = dispatch.getCall(2).args[0];
    await expectRequest(fn, `/linode/instances/${ipA.linode_id}/ips`);

    fn = dispatch.getCall(3).args[0];
    await expectRequest(fn, `/linode/instances/${ipB.linode_id}`);

    fn = dispatch.getCall(4).args[0];
    await expectRequest(fn, `/linode/instances/${ipB.linode_id}/ips`);

    fn = dispatch.getCall(5).args[0];
    expectObjectDeepEquals(fn, push(`/linodes/${testLinode.label}`));
  });
});
