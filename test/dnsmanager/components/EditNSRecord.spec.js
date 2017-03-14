import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { expectRequest } from '@/common';
import EditNSRecord from '~/dnsmanager/components/EditNSRecord';

describe('dnsmanager/components/EditNSRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders fields correctly', () => {
    const currentZone = api.dnszones.dnszones['1'];
    const currentRecord = currentZone._records.records[4];
    const page = mount(
      <EditNSRecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const nameserver = page.find('#nameserver');
    expect(nameserver.props().value).to.equal(currentRecord.target);

    const subdomain = page.find('#subdomain');
    expect(subdomain.props().value).to.equal(currentRecord.name || currentZone.dnszone);

    const ttl = page.find('#ttl');
    expect(+ttl.props().value).to.equal(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('submits data onsubmit and closes modal', async () => {
    const currentZone = api.dnszones.dnszones['1'];
    const currentRecord = currentZone._records.records[4];
    const close = sandbox.spy();
    const page = mount(
      <EditNSRecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('nameserver', 'ns1.tester1234.com');
    changeInput('subdomain', 'tester1234.com');
    changeInput('ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expect(close.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/dns/zones/${currentZone.id}/records/${currentRecord.id}`, {
      method: 'PUT',
      body: {
        target: 'ns1.tester1234.com',
        name: 'tester1234.com',
        ttl_sec: 3600,
        type: 'NS',
      },
    });
  });

  it('creates a new NS record and closes the modal', async () => {
    const currentZone = api.dnszones.dnszones['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditNSRecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('nameserver', 'ns1.tester1234.com');
    changeInput('subdomain', 'tester1234.com');
    changeInput('ttl', 3600);

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expect(close.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/dns/zones/${currentZone.id}/records/`, {
      method: 'POST',
      body: {
        target: 'ns1.tester1234.com',
        name: 'tester1234.com',
        ttl_sec: 3600,
        type: 'NS',
      },
    });
  });
});
