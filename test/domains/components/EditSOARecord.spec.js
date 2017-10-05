import _ from 'lodash';
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditSOARecord from '~/domains/components/EditSOARecord';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';


describe('domains/components/EditSOARecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly', () => {
    const currentZone = api.domains.domains[1];
    const page = mount(
      <EditSOARecord
        dispatch={() => {}}
        domains={currentZone}
        close={() => () => {}}
      />
    );

    const zone = page.find('#domain');
    expect(zone.props().value).to.equal(currentZone.domain);

    const group = page.find('#group');
    expect(group.props().value).to.equal(currentZone.group);

    const email = page.find('#email');
    expect(email.props().value).to.equal(currentZone.soa_email);

    const defaultTTL = page.find('#defaultTTL');
    expect(defaultTTL.props().value).to.equal(currentZone.ttl_sec.toString());

    const refreshRate = page.find('#refreshRate');
    expect(refreshRate.props().value).to.equal(currentZone.refresh_sec.toString());

    const retryRate = page.find('#retryRate');
    expect(retryRate.props().value).to.equal(currentZone.retry_sec.toString());

    const expireTime = page.find('#expireTime');
    expect(expireTime.props().value).to.equal(currentZone.expire_sec);
  });

  it('submits data onsubmit and closes modal', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains[1];
    const close = sandbox.spy();
    const page = mount(
      <EditSOARecord
        dispatch={dispatch}
        domains={currentZone}
        close={() => close}
      />
    );

    changeInput(page, 'domain', 'tester1234.com');
    changeInput(page, 'group', 'tester-zones');
    changeInput(page, 'email', 'admin@tester1234.com');
    changeInput(page, 'defaultTTL', 3600);
    changeInput(page, 'refreshRate', 3600);
    changeInput(page, 'retryRate', 3600);
    changeInput(page, 'expireTime', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}`, {
        method: 'PUT',
        body: {
          domain: 'tester1234.com',
          group: 'tester-zones',
          axfr_ips: ['44.55.66.77'],
          master_ips: ['127.0.0.1', '255.255.255.1', '123.123.123.7'],
          soa_email: 'admin@tester1234.com',
          status: 'active',
          ttl_sec: 3600,
          refresh_sec: 3600,
          retry_sec: 3600,
          expire_sec: 3600,
        },
      }),
    ]);
  });

  it('doesnt send status when domain has errors', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains[3];
    const close = sandbox.spy();
    const page = mount(
      <EditSOARecord
        dispatch={dispatch}
        domains={currentZone}
        close={() => close}
      />
    );

    await page.find('Form').props().onSubmit();

    const internalNestedObjects = ['_records', '_polling'];
    const unsubmittedFields = ['description', 'id', 'type'];
    const regularZoneSubmission = _.omit(currentZone,
                                         [...internalNestedObjects, ...unsubmittedFields]);
    const expectedZoneSubmission = _.omit(regularZoneSubmission, 'status');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}`, {
        method: 'PUT',
        body: expectedZoneSubmission,
      }),
    ]);
  });
});
