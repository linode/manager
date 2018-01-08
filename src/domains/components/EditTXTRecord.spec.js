import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditTXTRecord from '~/domains/components/EditTXTRecord';

import { createSimulatedEvent, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';

describe('domains/components/EditTXTRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const wrapper = shallow(
      <EditTXTRecord
        title="EditTXTRecord"
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders fields correctly for TXT record', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const wrapper = shallow(
      <EditTXTRecord
        title="EditTXTRecord"
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );

    const textname = wrapper.find('Input#textname');


    const textvalue = wrapper.find('Input#textvalue');

    const ttl = wrapper.find('SelectDNSSeconds#ttl');

    expect(textname.props().value).toBe(currentRecord.name);
    expect(textvalue.props().value).toBe(currentRecord.target);
    expect(ttl.props().value).toBe(0);
    expect(ttl.props().defaultSeconds).toBe(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('submits data onsubmit and closes modal for TXT record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditTXTRecord
        title="EditTXTRecord"
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const textname = wrapper.find('Input#textname');

    const textvalue = wrapper.find('Input#textvalue');

    const ttl = wrapper.find('SelectDNSSeconds#ttl');

    textname.simulate('change', createSimulatedEvent('textname', 'somename'));
    textvalue.simulate('change', createSimulatedEvent('textvalue', 'someval'));
    ttl.simulate('change', createSimulatedEvent('ttl', 3600));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          target: 'someval',
          name: 'somename',
          ttl_sec: 3600,
          type: 'TXT',
        },
      }),
    ]);
  });

  it('creates a new TXT record and closes the modal', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditTXTRecord
        title="EditTXTRecord"
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const textname = wrapper.find('Input#textname');

    const textvalue = wrapper.find('Input#textvalue');

    const ttl = wrapper.find('SelectDNSSeconds#ttl');

    textname.simulate('change', createSimulatedEvent('textname', 'somename'));
    textvalue.simulate('change', createSimulatedEvent('textvalue', 'someval'));
    ttl.simulate('change', createSimulatedEvent('ttl', 3600));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          target: 'someval',
          name: 'somename',
          ttl_sec: 3600,
          type: 'TXT',
        },
      }),
    ]);
  });
});
