import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditARecord from '~/domains/components/EditARecord';

import SelectDNSSeconds from '~/domains/components/SelectDNSSeconds';

import { expectDispatchOrStoreErrors, expectRequest, createSimulatedEvent } from '~/test.helpers';
import { api } from '~/data';


describe('domains/components/EditARecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[1];
    const wrapper = shallow(
      <EditARecord
        dispatch={dispatch}
        zone={currentZone}
        title="boop"
        id={currentRecord.id}
        close={() => { }}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders fields correctly', () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[1];
    const wrapper = shallow(
      <EditARecord
        dispatch={dispatch}
        zone={currentZone}
        title="boop"
        id={currentRecord.id}
        close={() => { }}
      />
    );

    const nameserver = wrapper.find('Input#hostname');

    const subdomain = wrapper.find('Input#ip');

    const ttl = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'ttl';
    });

    expect(nameserver.props().value).toBe(currentRecord.name);
    expect(subdomain.props().value).toBe(currentRecord.target);
    expect(ttl.props().value).toBe(0);
    expect(ttl.props().defaultSeconds).toBe(3600);
  });

  it('saves an existing A record', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[1];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditARecord
        dispatch={dispatch}
        zone={currentZone}
        title="title"
        id={currentRecord.id}
        close={close}
      />
    );

    const hostnameInput = wrapper.find('Input#hostname');

    const ipInput = wrapper.find('Input#ip');

    const ttlInput = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('name') === 'ttl';
    });

    hostnameInput.simulate('change', createSimulatedEvent('hostname', 'tee'));
    ipInput.simulate('change', createSimulatedEvent('ip', '4.4.4.4'));
    ttlInput.simulate('change', createSimulatedEvent('ttl', 1));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          target: '4.4.4.4',
          name: 'tee',
          ttl_sec: 1,
          type: 'A',
        },
      }),
    ], 1);

    expect(close.callCount).toBe(1);
  });

  it('creates a new AAAA record', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditARecord
        dispatch={dispatch}
        title="title"
        zone={currentZone}
        close={close}
      />
    );
    const hostnameInput = wrapper.find('Input#hostname');

    const ipInput = wrapper.find('Input#ip');

    const ttlInput = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('name') === 'ttl';
    });

    hostnameInput.simulate('change', createSimulatedEvent('hostname', 'tee'));
    ipInput.simulate(
      'change',
      createSimulatedEvent('ip', '2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    );
    ttlInput.simulate('change', createSimulatedEvent('ttl', 1));
    // changeInput(page, 'hostname', 'tee');
    // changeInput(page, 'ip', '2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    // changeInput(page, 'ttl', 1);

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          target: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
          name: 'tee',
          ttl_sec: 1,
          type: 'AAAA',
        },
      }),
    ], 1);

    expect(close.callCount).toBe(1);
  });
});
