import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditSRVRecord from '~/domains/components/EditSRVRecord';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';


describe('domains/components/EditSRVRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly for SRV record', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[6];
    const page = mount(
      <EditSRVRecord
        dispatch={() => {}}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const service = page.find('#service');
    expect(service.props().value).to.equal(currentRecord.service);

    const protocol = page.find('#protocol');
    expect(protocol.props().value).to.equal(currentRecord.protocol);

    const target = page.find('#target');
    expect(target.props().value).to.equal(currentRecord.target);

    const priority = page.find('#priority');
    expect(priority.props().value).to.equal(currentRecord.priority);

    const weight = page.find('#weight');
    expect(weight.props().value).to.equal(currentRecord.weight);

    const port = page.find('#port');
    expect(port.props().value).to.equal(currentRecord.port);

    const ttl = page.find('#ttl');
    expect(+ttl.props().value).to.equal(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('submits data onsubmit and closes modal for SRV record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[6];
    const close = sandbox.spy();
    const page = mount(
      <EditSRVRecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    changeInput(page, 'service', '_ips');
    changeInput(page, 'protocol', '_udp');
    changeInput(page, 'target', 'ns2.service.com');
    changeInput(page, 'priority', 77);
    changeInput(page, 'weight', 7);
    changeInput(page, 'port', 777);
    changeInput(page, 'ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          service: '_ips',
          protocol: '_udp',
          target: 'ns2.service.com',
          priority: 77,
          weight: 7,
          port: 777,
          ttl_sec: 3600,
          type: 'SRV',
        },
      }),
    ]);
  });

  it('creates a new SRV record and closes the modal', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditSRVRecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    changeInput(page, 'service', '_ips');
    changeInput(page, 'protocol', '_udp');
    changeInput(page, 'target', 'ns2.service.com');
    changeInput(page, 'priority', 77);
    changeInput(page, 'weight', 7);
    changeInput(page, 'port', 777);
    changeInput(page, 'ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          service: '_ips',
          protocol: '_udp',
          target: 'ns2.service.com',
          priority: 77,
          weight: 7,
          port: 777,
          ttl_sec: 3600,
          type: 'SRV',
        },
      }),
    ]);
  });
});
