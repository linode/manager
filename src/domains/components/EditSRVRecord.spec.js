import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditSRVRecord from '~/domains/components/EditSRVRecord';

import { createSimulatedEvent, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';


describe('domains/components/EditSRVRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[6];
    const wrapper = shallow(
      <EditSRVRecord
        title="EditSRVRecord"
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders fields correctly for SRV record', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[6];
    const page = shallow(
      <EditSRVRecord
        title="EditSRVRecord"
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );

    const service = page.find('Input#service');

    const protocol = page.find('Select#protocol');

    const target = page.find('Input#target');

    const priority = page.find('Input#priority');

    const weight = page.find('Input#weight');

    const port = page.find('Input#port');

    const ttl = page.find('SelectDNSSeconds#ttl');

    expect(service.props().value).toEqual(currentRecord.service);
    expect(protocol.props().value).toEqual(currentRecord.protocol);
    expect(target.props().value).toEqual(currentRecord.target);
    expect(priority.props().value).toEqual(currentRecord.priority);
    expect(weight.props().value).toEqual(currentRecord.weight);
    expect(port.props().value).toEqual(currentRecord.port);
    expect(+ttl.props().value).toEqual(0);
    expect(+ttl.props().defaultSeconds).toEqual(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('submits data onsubmit and closes modal for SRV record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[6];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditSRVRecord
        title="EditSRVRecord"
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const service = wrapper.find('Input#service');

    const protocol = wrapper.find('Select#protocol');

    const target = wrapper.find('Input#target');

    const priority = wrapper.find('Input#priority');

    const weight = wrapper.find('Input#weight');

    const port = wrapper.find('Input#port');

    const ttl = wrapper.find('SelectDNSSeconds#ttl');

    service.simulate('change', createSimulatedEvent('service', '_ips'));
    protocol.simulate('change', createSimulatedEvent('protocol', '_udp'));
    target.simulate('change', createSimulatedEvent('target', 'ns2.service.com'));
    priority.simulate('change', createSimulatedEvent('priority', 77));
    weight.simulate('change', createSimulatedEvent('weight', 7));
    port.simulate('change', createSimulatedEvent('port', 777));
    ttl.simulate('change', createSimulatedEvent('ttl', 3600));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toEqual(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          service: '_ips',
          protocol: '_udp',
          target: 'ns2.service.com',
          priority: 77,
          weight: 7,
          port: 777,
          ttl_sec: 3600,
          type: 'SRV',
        },
      }),
    ]);
  });

  it('creates a new SRV record and closes the modal', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditSRVRecord
        title="EditSRVRecord"
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );
    const service = wrapper.find('Input#service');

    const protocol = wrapper.find('Select#protocol');

    const target = wrapper.find('Input#target');

    const priority = wrapper.find('Input#priority');

    const weight = wrapper.find('Input#weight');

    const port = wrapper.find('Input#port');

    const ttl = wrapper.find('SelectDNSSeconds#ttl');

    service.simulate('change', createSimulatedEvent('service', '_ips'));
    protocol.simulate('change', createSimulatedEvent('protocol', '_udp'));
    target.simulate('change', createSimulatedEvent('target', 'ns2.service.com'));
    priority.simulate('change', createSimulatedEvent('priority', 77));
    weight.simulate('change', createSimulatedEvent('weight', 7));
    port.simulate('change', createSimulatedEvent('port', 777));
    ttl.simulate('change', createSimulatedEvent('ttl', 3600));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toEqual(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          service: '_ips',
          protocol: '_udp',
          target: 'ns2.service.com',
          priority: 77,
          weight: 7,
          port: 777,
          ttl_sec: 3600,
          type: 'SRV',
        },
      }),
    ]);
  });
});
