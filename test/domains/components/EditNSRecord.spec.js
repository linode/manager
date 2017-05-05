import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditNSRecord from '~/domains/components/EditNSRecord';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';


describe('domains/components/EditNSRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const page = mount(
      <EditNSRecord
        dispatch={() => {}}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const nameserver = page.find('#nameserver');
    expect(nameserver.props().value).to.equal(currentRecord.target);

    const subdomain = page.find('#subdomain');
    expect(subdomain.props().value).to.equal(currentRecord.name || currentZone.domain);

    const ttl = page.find('#ttl');
    expect(+ttl.props().value).to.equal(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('updates an existing NS record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
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
      page.find({ name }).simulate('change', { target: { name, value } });

    changeInput('nameserver', 'ns1.tester1234.com');
    changeInput('subdomain', 'tester1234.com');
    changeInput('ttl', 3600);

    await page.find('Form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          target: 'ns1.tester1234.com',
          name: 'tester1234.com',
          ttl_sec: 3600,
          type: 'NS',
        },
      }),
    ]);
  });

  it('creates a new NS record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditNSRecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.find({ name }).simulate('change', { target: { name, value } });

    changeInput('nameserver', 'ns1.tester1234.com');
    changeInput('subdomain', 'tester1234.com');
    changeInput('ttl', 3600);

    await page.find('Form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          target: 'ns1.tester1234.com',
          name: 'tester1234.com',
          ttl_sec: 3600,
          type: 'NS',
        },
      }),
    ]);
  });
});
