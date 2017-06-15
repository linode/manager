import { expect } from 'chai';
import { mount } from 'enzyme';
import _ from 'lodash';
import React from 'react';
import sinon from 'sinon';

import IPTransfer from '~/linodes/linode/networking/components/IPTransfer';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';
import { state } from '@/data';


const { linodes } = state.api;

describe('linodes/linode/networking/components/IPTransfer', () => {
  const sandbox = sinon.sandbox.create();

  const linodesInRegion = _.pickBy(linodes.linodes, l =>
      l.region.id === testLinode.region.id);

  const allIps = {};
  Object.values(linodesInRegion).forEach(linode => {
    linode._ips.ipv4.public.forEach(ip => {
      allIps[ip.address] = ip;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders ips', () => {
    const page = mount(
      <IPTransfer
        dispatch={() => {}}
        linodes={linodesInRegion}
        linode={testLinode}
      />
    );

    const sectionA = page.find('#sectionA');
    const rowsA = sectionA.find('.TableRow');
    expect(rowsA.length).to.equal(testLinode._ips.ipv4.public.length);
    rowsA.forEach(row => {
      const address = row.find('.TableCell').at(1).text();
      const ip = allIps[address.split(' ')[0]];
      expect(address).to.equal(`${ip.address} (${ip.rdns})`);
    });

    const sectionB = page.find('#sectionB');
    const linodeB = linodes.linodes[page.find('select').props().value];
    const rowsB = sectionB.find('.TableRow');
    expect(rowsB.length).to.equal(linodeB._ips.ipv4.public.length);
    rowsB.forEach(row => {
      const address = row.find('.TableCell').at(1).text();
      const ip = allIps[address.split(' ')[0]];
      expect(address).to.equal(`${ip.address} (${ip.rdns})`);
    });
  });

  it('updates list of IPs when linodeB changes', () => {
    const page = mount(
      <IPTransfer
        dispatch={() => {}}
        linodes={linodesInRegion}
        linode={testLinode}
      />
    );

    const sectionB = page.find('#sectionB');
    const select = page.find('select');
    const linodeB = linodes.linodes[select.props().value];
    const notLinodeB = Object.values(linodesInRegion).filter(
      ({ id }) => id !== linodeB.id)[0];

    select.simulate('change', { record: { name: 'selectedOtherLinode', value: notLinodeB.id } });

    const rowsB = sectionB.find('.TableRow');
    expect(rowsB.length).to.equal(notLinodeB._ips.ipv4.public.length);
    rowsB.forEach(row => {
      const address = row.find('.TableCell').at(1).text();
      const ip = allIps[address.split(' ')[0]];
      expect(address).to.equal(`${ip.address} (${ip.rdns})`);
    });
  });

  it('calls the API correctly', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <IPTransfer
        dispatch={dispatch}
        linodes={linodesInRegion}
        linode={testLinode}
      />
    );

    const sectionAFirstIp = page.find('#sectionA .TableRow').at(0);
    const addressA = sectionAFirstIp.find('.TableCell').at(1).text()
                                    .split(' ')[0];
    const ipA = allIps[addressA];
    const checkboxA = sectionAFirstIp.find('Checkbox');
    const checkboxAProps = checkboxA.props();
    checkboxAProps.onChange({ target: { checked: true } });

    const sectionBFirstIp = page.find('#sectionB .TableRow').at(0);
    const addressB = sectionBFirstIp.find('.TableCell').at(1).text()
                                    .split(' ')[0];
    const ipB = allIps[addressB];
    const checkboxB = sectionBFirstIp.find('Checkbox');
    const checkboxBProps = checkboxB.props();
    checkboxBProps.onChange({ target: { checked: true } });

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/networking/ip-assign', {
        method: 'POST',
        body: {
          region: testLinode.region.id,
          assignments: [
            { address: ipA.address, linode_id: ipB.linode_id },
            { address: ipB.address, linode_id: ipA.linode_id },
          ],
        },
      }),
      async ([fn]) => {
        const _dispatch = sinon.stub();
        const promiseAllStub = sinon.stub(Promise, 'all');
        fn(_dispatch);

        expect(promiseAllStub.callCount).to.equal(1);
        expect(_dispatch.callCount).to.equal(3);

        let _fn = _dispatch.getCall(1).args[0];
        await expectRequest(_fn, `/linode/instances/${ipA.linode_id}/ips`);

        _fn = _dispatch.getCall(2).args[0];
        await expectRequest(_fn, `/linode/instances/${ipB.linode_id}/ips`);

        _fn = _dispatch.getCall(0).args[0];
        _dispatch.reset();
        _dispatch.returns({ total_pages: 1, linodes: [], total_results: 0 });
        await _fn(_dispatch, () => state);
        _fn = _dispatch.firstCall.args[0];
        await expectRequest(_fn, '/linode/instances/?page=1', undefined, {
          linodes: [],
        });
      },
    ]);
  });
});
