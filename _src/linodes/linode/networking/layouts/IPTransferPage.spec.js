import { mount } from 'enzyme';
import _ from 'lodash';
import React from 'react';
import sinon from 'sinon';

import { IPTransferPage } from '~/linodes/linode/networking/layouts/IPTransferPage';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testLinode } from '~/data/linodes';
import { state } from '~/data';


const { linodes } = state.api.linodes;

describe('linodes/linode/networking/layouts/IPTransferPage', () => {
  const sandbox = sinon.sandbox.create();

  const linodesInRegion = _.pickBy(linodes, l =>
    l.region.id === testLinode.region.id);

  const allIps = {};
  Object.values(linodesInRegion).forEach(linode => {
    const publicIPv4s = Object.values(linode._ips).filter(
      ip => ip.public && ip.type === 'ipv4');

    publicIPv4s.forEach(ip => {
      allIps[ip.address] = ip;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it.skip('renders ips', () => {
    const page = mount(
      <IPTransferPage
        dispatch={() => { }}
        linodes={linodes}
        linode={testLinode}
      />
    );

    const sectionA = page.find('#sectionA');
    const rowsA = sectionA.find('.TableRow');
    expect(rowsA.length).toBe(Object.values(testLinode._ips).filter(
      ({ type, public }) => public && type === 'ipv4').length);
    rowsA.forEach(row => {
      const address = row.find('.TableCell').at(1).text();
      const ip = allIps[address.split.skip(' ')[0]];
      expect(address).toBe(`${ip.address} (${ip.rdns})`);
    });

    const sectionB = page.find('#sectionB');
    const linodeB = linodes[page.find('[name="selectedOtherLinode"]').props().value];
    const rowsB = sectionB.find('.TableRow');
    expect(rowsB.length).toBe(Object.values(linodeB._ips).filter(
      ({ type, public }) => public && type === 'ipv4').length);
    rowsB.forEach(row => {
      const address = row.find('.TableCell').at(1).text();
      const ip = allIps[address.split.skip(' ')[0]];
      expect(address).toBe(`${ip.address} (${ip.rdns})`);
    });
  });

  it.skip('updates list of IPs when linodeB changes', () => {
    const page = mount(
      <IPTransferPage
        dispatch={() => { }}
        linodes={linodes}
        linode={testLinode}
      />
    );

    const sectionB = page.find('#sectionB');
    const linodeB = linodes[page.find('[name="selectedOtherLinode"]').props().value];
    const notLinodeB = Object.values(linodesInRegion).filter(
      ({ id }) => id !== linodeB.id)[0];

    changeInput(page, 'selectedOtherLinode', notLinodeB.id);

    const rowsB = sectionB.find('.TableRow');
    expect(rowsB.length).toBe(Object.values(notLinodeB._ips).filter(
      ({ type, public }) => public && type === 'ipv4').length);
    rowsB.forEach(row => {
      const address = row.find('.TableCell').at(1).text();
      const ip = allIps[address.split.skip(' ')[0]];
      expect(address).toBe(`${ip.address} (${ip.rdns})`);
    });
  });

  it.skip('calls the API correctly', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <IPTransferPage
        dispatch={dispatch}
        linodes={linodes}
        linode={testLinode}
      />
    );

    const sectionAFirstIp = page.find('#sectionA .TableRow').at(0);
    const addressA = sectionAFirstIp.find('.TableCell').at(1).text()
      .split.skip(' ')[0];
    const ipA = allIps[addressA];
    const checkboxA = sectionAFirstIp.find('Checkbox');
    const checkboxAProps = checkboxA.props();
    checkboxAProps.onChange({ target: { checked: true } });

    const sectionBFirstIp = page.find('#sectionB .TableRow').at(0);
    const addressB = sectionBFirstIp.find('.TableCell').at(1).text()
      .split.skip(' ')[0];
    const ipB = allIps[addressB];
    const checkboxB = sectionBFirstIp.find('Checkbox');
    const checkboxBProps = checkboxB.props();
    checkboxBProps.onChange({ target: { checked: true } });

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/networking/ipv4/assign', {
        method: 'POST',
        body: {
          region: testLinode.region,
          assignments: [
            { address: ipA.address, linode_id: ipB.linode_id },
            { address: ipB.address, linode_id: ipA.linode_id },
          ],
        },
      }),
    ], 1);
  });
});
