import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditARecord from '~/domains/components/EditARecord';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
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
        title="boop"
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
        title="title"
        id={currentRecord.id}
        close={close}
      />
    );

    changeInput(page, 'hostname', 'tee');
    changeInput(page, 'ip', '4.4.4.4');
    changeInput(page, 'ttl', 1);

    await page.find('Form').props().onSubmit();

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
        title="title"
        zone={currentZone}
        close={close}
      />
    );

    changeInput(page, 'hostname', 'tee');
    changeInput(page, 'ip', '2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    changeInput(page, 'ttl', 1);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          target: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
          name: 'tee',
          ttl_sec: 1,
          type: 'AAAA',
        },
      }),
    ], 1);

    expect(close.callCount).to.equal(1);
  });
});
