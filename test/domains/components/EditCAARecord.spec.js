import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditCAARecord from '~/domains/components/EditCAARecord';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';

describe('domains/components/EditCAARecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly for CAA record', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[7];
    const page = mount(
      <EditCAARecord
        dispatch={() => {}}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const tag = page.find('#tag');
    expect(tag.props().value).to.equal(currentRecord.tag);

    const target = page.find('#target');
    expect(target.props().value).to.equal(currentRecord.target);

    const name = page.find('#name');
    expect(name.props().value).to.equal(currentRecord.name);

    const ttl = page.find('#ttl');
    expect(+ttl.props().value).to.equal(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('submits data onsubmit and closes modal for CAA record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[7];
    const close = sandbox.spy();
    const page = mount(
      <EditCAARecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    changeInput(page, 'tag', 'issue');
    changeInput(page, 'target', 'certsign.ro');
    changeInput(page, 'name', 'www.mysite.com');
    changeInput(page, 'ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          tag: 'issue',
          target: 'certsign.ro',
          type: 'CAA',
          name: 'www.mysite.com',
          ttl_sec: 3600,
        },
      }),
    ]);
  });

  it('creates a new CAA record and closes the modal', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditCAARecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    changeInput(page, 'tag', 'iodef');
    changeInput(page, 'target', 'shenanigans.co');
    changeInput(page, 'name', 'www.mysite.com');
    changeInput(page, 'ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          tag: 'iodef',
          target: 'shenanigans.co',
          name: 'www.mysite.com',
          ttl_sec: 3600,
        },
      }),
    ]);
  });
});
