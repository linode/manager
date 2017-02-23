import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { expectRequest } from '@/common';
import EditCNAMERecord from '~/dnsmanager/components/EditCNAMERecord';

describe('dnsmanager/components/EditCNAMERecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders fields correctly CNAME', () => {
    const currentZone = api.dnszones.dnszones['1'];
    const currentRecord = currentZone._records.records[2];
    const page = mount(
      <EditCNAMERecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const hostname = page.find('#hostname');
    expect(hostname.props().value).to.equal(currentRecord.name);

    const alias = page.find('#alias');
    expect(alias.props().value).to.equal(currentRecord.target);

    const ttl = page.find('#ttl');
    expect(+ttl.props().value).to.equal(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('submits data onsubmit and closes modal for CNAME', async () => {
    const currentZone = api.dnszones.dnszones['1'];
    const currentRecord = currentZone._records.records[4];
    const close = sandbox.spy();
    const page = mount(
      <EditCNAMERecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('hostname', 'www.tester1234.com');
    changeInput('alias', 'www.othertester1234.com');
    changeInput('ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expect(close.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(
      fn, `/dns/zones/${currentZone.id}/records/${currentRecord.id}`, undefined, undefined, {
        method: 'PUT',
        body: {
          name: 'www.tester1234.com',
          target: 'www.othertester1234.com',
          ttl_sec: 3600,
          type: 'CNAME',
        },
      });
  });

  it('creates a new CNAME record and closes the modal', async () => {
    const currentZone = api.dnszones.dnszones['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditCNAMERecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('hostname', 'www.tester1234.com');
    changeInput('alias', 'www.othertester1234.com');
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
          name: 'www.tester1234.com',
          target: 'www.othertester1234.com',
          ttl_sec: 3600,
          type: 'CNAME',
        },
      });
  });
});
