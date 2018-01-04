import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditCNAMERecord from '~/domains/components/EditCNAMERecord';

import { createSimulatedEvent, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';

describe('domains/components/EditCNAMERecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[2];

    const wrapper = shallow(
      <EditCNAMERecord
        title="EditCNAMERecord"
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders fields correctly CNAME', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[2];
    const wrapper = shallow(
      <EditCNAMERecord
        title="EditCNAMERecord"
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );

    const hostname = wrapper.find('Input#hostname');

    const alias = wrapper.find('Input#alias');

    const ttl = wrapper.find('SelectDNSSeconds#ttl');

    expect(hostname.props().value).toBe(currentRecord.name);
    expect(alias.props().value).toBe(currentRecord.target);
    expect(ttl.props().defaultSeconds).toBe(currentRecord.ttl_sec || currentZone.ttl_sec);
    expect(ttl.props().value).toBe(0);
  });

  it('saves an existing CNAME record', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditCNAMERecord
        title="EditCNAMERecord"
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const hostname = wrapper.find('Input#hostname');

    const alias = wrapper.find('Input#alias');

    const ttl = wrapper.find('SelectDNSSeconds#ttl');

    hostname.simulate('change', createSimulatedEvent('hostname', 'www.tester1234.com'));
    alias.simulate('change', createSimulatedEvent('alias', 'www.othertester1234.com'));
    ttl.simulate('change', createSimulatedEvent('ttl', 3600));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          name: 'www.tester1234.com',
          target: 'www.othertester1234.com',
          ttl_sec: 3600,
          type: 'CNAME',
        },
      }),
    ], 1);

    expect(close.callCount).toBe(1);
  });

  it('creates a new CNAME record', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditCNAMERecord
        title="EditCNAMERecord"
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const hostname = wrapper.find('Input#hostname');

    const alias = wrapper.find('Input#alias');

    const ttl = wrapper.find('SelectDNSSeconds#ttl');

    hostname.simulate('change', createSimulatedEvent('hostname', 'www.tester1234.com'));
    alias.simulate('change', createSimulatedEvent('alias', 'www.othertester1234.com'));
    ttl.simulate('change', createSimulatedEvent('ttl', 3600));


    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          name: 'www.tester1234.com',
          target: 'www.othertester1234.com',
          ttl_sec: 3600,
          type: 'CNAME',
        },
      }),
    ], 1);

    expect(close.callCount).toBe(1);
  });
});
