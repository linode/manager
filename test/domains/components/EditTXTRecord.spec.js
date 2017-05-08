import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditTXTRecord from '~/domains/components/EditTXTRecord';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';


describe('domains/components/EditTXTRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly for TXT record', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const page = mount(
      <EditTXTRecord
        dispatch={() => {}}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const textname = page.find('#textname');
    expect(textname.props().value).to.equal(currentRecord.name);

    const textvalue = page.find('#textvalue');
    expect(textvalue.props().value).to.equal(currentRecord.target);

    const ttl = page.find('#ttl');
    expect(+ttl.props().value).to.equal(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('submits data onsubmit and closes modal for TXT record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const close = sandbox.spy();
    const page = mount(
      <EditTXTRecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.find({ name }).simulate('change', { target: { name, value } });

    changeInput('textname', 'somename');
    changeInput('textvalue', 'someval');
    changeInput('ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          target: 'someval',
          name: 'somename',
          ttl_sec: 3600,
          type: 'TXT',
        },
      }),
    ]);
  });

  it('creates a new TXT record and closes the modal', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditTXTRecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.find({ name }).simulate('change', { target: { name, value } });

    changeInput('textname', 'somename');
    changeInput('textvalue', 'someval');
    changeInput('ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          target: 'someval',
          name: 'somename',
          ttl_sec: 3600,
          type: 'TXT',
        },
      }),
    ]);
  });
});
