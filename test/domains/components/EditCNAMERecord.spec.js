import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import DomainInput from '~/domains/components/DomainInput';
import EditCNAMERecord from '~/domains/components/EditCNAMERecord';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';


describe('domains/components/EditCNAMERecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly CNAME', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[2];
    const page = mount(
      <EditCNAMERecord
        dispatch={() => {}}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const hostnameVal = DomainInput.stripBase(currentRecord.name, currentZone.domain);
    const hostname = page.find('#hostname');
    expect(hostname.props().value).to.equal(hostnameVal);

    const alias = page.find('#alias');
    expect(alias.props().value).to.equal(currentRecord.target);

    const ttl = page.find('#ttl');
    expect(+ttl.props().value).to.equal(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('saves an existing CNAME record', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[2];
    const close = sandbox.spy();
    const page = mount(
      <EditCNAMERecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    changeInput(page, 'hostname', 'www2');
    changeInput(page, 'alias', 'www.tester1234.com');
    changeInput(page, 'ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          name: 'www2',
          target: 'www.tester1234.com',
          ttl_sec: 3600,
          type: 'CNAME',
        },
      }),
    ], 1);

    expect(close.callCount).to.equal(1);
  });

  it('creates a new CNAME record', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditCNAMERecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    changeInput(page, 'hostname', 'www');
    changeInput(page, 'alias', 'www.othertester1234.com');
    changeInput(page, 'ttl', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          name: 'www',
          target: 'www.othertester1234.com',
          ttl_sec: 3600,
          type: 'CNAME',
        },
      }),
    ], 1);

    expect(close.callCount).to.equal(1);
  });
});
