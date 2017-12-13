import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditSRVRecord from '~/domains/components/EditSRVRecord';
import { Input, Select } from 'linode-components';
import SelectDNSSeconds from '~/domains/components/SelectDNSSeconds';

import { createSimulatedEvent, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';


describe('domains/components/EditSRVRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly for SRV record', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[6];
    const page = shallow(
      <EditSRVRecord
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );

    const service = page.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'service';
    });

    const protocol = page.findWhere((n) => {
      return n.type() === Select && n.prop('id') === 'protocol';
    });

    const target = page.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'target';
    });

    const priority = page.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'priority';
    });

    const weight = page.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'weight';
    });

    const port = page.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'port';
    });

    const ttl = page.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'ttl';
    });

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
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const service = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'service';
    });

    const protocol = wrapper.findWhere((n) => {
      return n.type() === Select && n.prop('id') === 'protocol';
    });

    const target = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'target';
    });

    const priority = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'priority';
    });

    const weight = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'weight';
    });

    const port = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'port';
    });

    const ttl = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'ttl';
    });

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
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );
    const service = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'service';
    });

    const protocol = wrapper.findWhere((n) => {
      return n.type() === Select && n.prop('id') === 'protocol';
    });

    const target = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'target';
    });

    const priority = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'priority';
    });

    const weight = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'weight';
    });

    const port = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'port';
    });

    const ttl = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'ttl';
    });

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
