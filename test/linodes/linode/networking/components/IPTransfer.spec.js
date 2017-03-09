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
    const rowsA = sectionA.find('.SecondaryTable-row');
    expect(rowsA.length).to.equal(testLinode._ips.ipv4.public.length);
    rowsA.forEach(row => {
      const address = row.find('.SecondaryTable-column').at(0).text();
      const ip = allIps[address.split(' ')[0]];
      expect(address).to.equal(`${ip.address} (${ip.rdns})`);
    });

    const sectionB = page.find('#sectionB');
    const linodeB = linodes.linodes[page.find('select').props().value];
    const rowsB = sectionB.find('.SecondaryTable-row');
    expect(rowsB.length).to.equal(linodeB._ips.ipv4.public.length);
    rowsB.forEach(row => {
      const address = row.find('.SecondaryTable-column').at(0).text();
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

    select.simulate('change', { target: { name: 'selectedOtherLinode', value: notLinodeB.id } });

    const rowsB = sectionB.find('.SecondaryTable-row');
    expect(rowsB.length).to.equal(notLinodeB._ips.ipv4.public.length);
    rowsB.forEach(row => {
      const address = row.find('.SecondaryTable-column').at(0).text();
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

    const sectionAFirstIp = page.find('#sectionA .SecondaryTable-row').at(0);
    const addressA = sectionAFirstIp.find('.SecondaryTable-column').at(0).text()
                                    .split(' ')[0];
    const ipA = allIps[addressA];
    sectionAFirstIp.find('Checkbox').props().onChange();

    const sectionBFirstIp = page.find('#sectionB .SecondaryTable-row').at(0);
    const addressB = sectionBFirstIp.find('.SecondaryTable-column').at(0).text()
                                    .split(' ')[0];
    const ipB = allIps[addressB];
    sectionBFirstIp.find('Checkbox').props().onChange();

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(6);

    let fn = dispatch.getCall(0).args[0];
    await expectRequest(
      fn, '/networking/ip-assign', undefined, undefined, {
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
