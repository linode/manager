import _ from 'lodash';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditSOARecord from '~/domains/components/EditSOARecord';

import { createSimulatedEvent,expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';
import { Input, Select } from 'linode-components/forms';
import SelectDNSSeconds from '~/domains/components/SelectDNSSeconds';


describe('domains/components/EditSOARecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly', () => {
    const currentZone = api.domains.domains[1];
    const wrapper = shallow(
      <EditSOARecord
        dispatch={() => { }}
        domains={currentZone}
        close={() => () => { }}
      />
    );

    const domain = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'domain';
    });

    const group = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'group';
    });

    const email = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'email';
    });

    const defaultTTL = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'defaultTTL';
    });

    const refreshRate = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'refreshRate';
    });

    const retryRate = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'retryRate';
    });

    const expireTime = wrapper.findWhere((n) => {
      return n.type() === Select && n.prop('id') === 'expireTime';
    });

    expect(domain.props().value).toBe(currentZone.domain);
    expect(group.props().value).toBe(currentZone.group);
    expect(email.props().value).toBe(currentZone.soa_email);
    expect(defaultTTL.props().value).toBe(currentZone.ttl_sec);
    expect(refreshRate.props().value).toBe(currentZone.refresh_sec);
    expect(retryRate.props().value).toBe(currentZone.retry_sec);
    expect(expireTime.props().value).toBe(currentZone.expire_sec);
  });

  it('submits data onsubmit and closes modal', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains[1];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditSOARecord
        dispatch={dispatch}
        domains={currentZone}
        close={() => close}
      />
    );

    const domain = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'domain';
    });

    const group = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'group';
    });

    const email = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'email';
    });

    const defaultTTL = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'defaultTTL';
    });

    const refreshRate = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'refreshRate';
    });

    const retryRate = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'retryRate';
    });

    const expireTime = wrapper.findWhere((n) => {
      return n.type() === Select && n.prop('id') === 'expireTime';
    });

    domain.simulate('change', createSimulatedEvent('domain', 'tester1234.com'));
    group.simulate('change', createSimulatedEvent('group', 'tester-zones'));
    email.simulate('change', createSimulatedEvent('email', 'admin@tester1234.com'));
    defaultTTL.simulate('change', createSimulatedEvent('defaultTTL', 3600));
    refreshRate.simulate('change', createSimulatedEvent('refreshRate', 3600));
    retryRate.simulate('change', createSimulatedEvent('retryRate', 3600));
    expireTime.simulate('change', createSimulatedEvent('expireTime', 3600));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
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
    const wrapper = shallow(
      <EditSOARecord
        dispatch={dispatch}
        domains={currentZone}
        close={() => close}
      />
    );

    await wrapper.props().onSubmit();

    const internalNestedObjects = ['_records', '_polling'];
    const unsubmittedFields = ['description', 'id', 'type'];
    const regularZoneSubmission = _.omit(currentZone,
      [...internalNestedObjects, ...unsubmittedFields]);

    const expectedZoneSubmission = _.omit(regularZoneSubmission, 'status');

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}`, {
        method: 'PUT',
        body: expectedZoneSubmission,
      }),
    ]);
  });
});
