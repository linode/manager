import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { expectRequest } from '@/common';
import EditTXTRecord from '~/dnsmanager/components/EditTXTRecord';

describe('dnsmanager/components/EditTXTRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders fields correctly for TXT record', () => {
    const currentZone = api.dnszones.dnszones['1'];
    const currentRecord = currentZone._records.records[4];
    const page = mount(
      <EditTXTRecord
        dispatch={dispatch}
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
    const currentZone = api.dnszones.dnszones['1'];
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
      page.instance().setState({ [name]: value });

    changeInput('textname', 'somename');
    changeInput('textvalue', 'someval');
    changeInput('ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expect(close.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(
      fn, `/dns/zones/${currentZone.id}/records/${currentRecord.id}`, undefined, undefined, {
        method: 'PUT',
        body: {
          target: 'someval',
          name: 'somename',
          ttl_sec: 3600,
          type: 'TXT',
        },
      });
  });

  it('creates a new TXT record and closes the modal', async () => {
    const currentZone = api.dnszones.dnszones['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditTXTRecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('textname', 'somename');
    changeInput('textvalue', 'someval');
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
          target: 'someval',
          name: 'somename',
          ttl_sec: 3600,
          type: 'TXT',
        },
      });
  });
});
