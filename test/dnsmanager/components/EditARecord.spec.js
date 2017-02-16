import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { expectRequest } from '@/common';
import EditARecord from '~/dnsmanager/components/EditARecord';

describe('dnsmanager/components/EditARecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders fields correctly', () => {
    const currentZone = api.dnszones.dnszones['1'];
    const currentRecord = currentZone._records.records[1];
    const page = mount(
      <EditARecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const nameserver = page.find('#hostname');
    expect(nameserver.props().value).to.equal(currentRecord.name);

    const subdomain = page.find('#ip');
    expect(subdomain.props().value).to.equal(currentRecord.target);

    const ttl = page.find('#ttl');
    expect(+ttl.props().value).to.equal(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('submits data onsubmit and closes modal', async () => {
    const currentZone = api.dnszones.dnszones['1'];
    const currentRecord = currentZone._records.records[1];
    const close = sandbox.spy();
    const page = mount(
      <EditARecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('hostname', 'tee');
    changeInput('ip', '4.4.4.4');
    changeInput('ttl', 1);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expect(close.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(
      fn, `/dns/zones/${currentZone.id}/records/${currentRecord.id}`, undefined, undefined, {
        method: 'PUT',
        body: {
          target: '4.4.4.4',
          name: 'tee',
          ttl_sec: 1,
          type: 'A',
        },
      });
  });

  it('creates a new AAAA record and closes the modal', async () => {
    const currentZone = api.dnszones.dnszones['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditARecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('ip', '1.1.1.8');
    changeInput('hostname', 'too');
    changeInput('ttl', 1);
    changeInput('type', 'AAAA');

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expect(close.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(
      fn, `/dns/zones/${currentZone.id}/records/`, undefined, undefined, {
        method: 'POST',
        body: {
          target: '1.1.1.8',
          name: 'too',
          ttl_sec: 1,
          type: 'AAAA',
        },
      });
  });
});
