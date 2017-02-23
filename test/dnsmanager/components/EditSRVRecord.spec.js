import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { expectRequest } from '@/common';
import EditSRVRecord from '~/dnsmanager/components/EditSRVRecord';

describe('dnsmanager/components/EditSRVRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders fields correctly for SRV record', () => {
    const currentZone = api.dnszones.dnszones['1'];
    const currentRecord = currentZone._records.records[6];
    const page = mount(
      <EditSRVRecord
        dispatch={dispatch}
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
    const currentZone = api.dnszones.dnszones['1'];
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

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('service', '_ips');
    changeInput('protocol', '_udp');
    changeInput('target', 'ns2.service.com');
    changeInput('priority', 77);
    changeInput('weight', 7);
    changeInput('port', 777);
    changeInput('ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expect(close.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(
      fn, `/dns/zones/${currentZone.id}/records/${currentRecord.id}`, undefined, undefined, {
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
      });
  });

  it('creates a new SRV record and closes the modal', async () => {
    const currentZone = api.dnszones.dnszones['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditSRVRecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('service', '_ips');
    changeInput('protocol', '_udp');
    changeInput('target', 'ns2.service.com');
    changeInput('priority', 77);
    changeInput('weight', 7);
    changeInput('port', 777);
    changeInput('ttl', 3600);

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expect(close.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(
      fn, `/dns/zones/${currentZone.id}/records/`, undefined, undefined, {
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
      });
  });
});
