import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditNSRecord from '~/domains/components/EditNSRecord';

import { createSimulatedEvent, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';

import SelectDNSSeconds from '~/domains/components/SelectDNSSeconds';


describe('domains/components/EditNSRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const wrapper = shallow(
      <EditNSRecord
        title="EditNSRRecord"
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders fields correctly', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const wrapper = shallow(
      <EditNSRecord
        title="EditNSRRecord"
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );

    const nameserver = wrapper.find('Input#nameserver');
    const subdomain = wrapper.find('Input#subdomain');
    const ttl = wrapper.findWhere((a) => a.type() === SelectDNSSeconds && a.prop('id') === 'ttl');

    expect(nameserver.props().value).toBe(currentRecord.target);
    expect(subdomain.props().value).toBe(currentRecord.name || currentZone.domain);
    expect(ttl.props().value).toBe(0);
    expect(ttl.props().defaultSeconds).toBe(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('updates an existing NS record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditNSRecord
        title="EditNSRRecord"
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );
    const nameserver = wrapper.find('Input#nameserver');
    const subdomain = wrapper.find('Input#subdomain');
    const ttl = wrapper.findWhere((a) => a.type() === SelectDNSSeconds && a.prop('id') === 'ttl');

    nameserver.simulate('change', createSimulatedEvent('nameserver', 'ns1.tester1234.com'));
    subdomain.simulate('change', createSimulatedEvent('subdomain', 'tester1234.com'));
    ttl.simulate('change', createSimulatedEvent('ttl', 3600));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          target: 'ns1.tester1234.com',
          name: 'tester1234.com',
          ttl_sec: 3600,
          type: 'NS',
        },
      }),
    ]);
  });

  it('creates a new NS record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditNSRecord
        title="EditNSRRecord"
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const nameserver = wrapper.find('Input#nameserver');
    const subdomain = wrapper.find('Input#subdomain');
    const ttl = wrapper.findWhere((a) => a.type() === SelectDNSSeconds && a.prop('id') === 'ttl');

    nameserver.simulate('change', createSimulatedEvent('nameserver', 'ns1.tester1234.com'));
    subdomain.simulate('change', createSimulatedEvent('subdomain', 'tester1234.com'));
    ttl.simulate('change', createSimulatedEvent('ttl', 3600));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          target: 'ns1.tester1234.com',
          name: 'tester1234.com',
          ttl_sec: 3600,
          type: 'NS',
        },
      }),
    ]);
  });
});
