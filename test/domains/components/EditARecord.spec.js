import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditARecord from '~/domains/components/EditARecord';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';


describe('domains/components/EditARecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly', () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
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

  it('saves an existing A record', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
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
      page.find({ name }).simulate('change', { target: { value, name } });

    changeInput('hostname', 'tee');
    changeInput('ip', '4.4.4.4');
    changeInput('ttl', 1);

    await page.find('Form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          target: '4.4.4.4',
          name: 'tee',
          ttl_sec: 1,
          type: 'A',
        },
      }),
    ], 1);

    expect(close.callCount).to.equal(1);
  });

  it('creates a new AAAA record', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditARecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.find({ name }).simulate('change', { target: { name, value } });

    changeInput('hostname', 'tee');
    changeInput('ip', '4.4.4.4');
    changeInput('ttl', 1);
    changeInput('type', 'AAAA');

    await page.find('Form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          target: '4.4.4.4',
          name: 'tee',
          ttl_sec: 1,
          type: 'AAAA',
        },
      }),
    ], 1);

    expect(close.callCount).to.equal(1);
  });
});
