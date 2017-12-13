import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditTXTRecord from '~/domains/components/EditTXTRecord';

import { createSimulatedEvent, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';
import { Input } from 'linode-components';
import SelectDNSSeconds from '~/domains/components/SelectDNSSeconds';


describe('domains/components/EditTXTRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly for TXT record', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const wrapper = shallow(
      <EditTXTRecord
        dispatch={() => {}}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const textname = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'textname';
    });


    const textvalue = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'textvalue';
    });

    const ttl = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'ttl';
    });

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
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const textname = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'textname';
    });

    const textvalue = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'textvalue';
    });

    const ttl = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'ttl';
    });

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
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const textname = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'textname';
    });

    const textvalue = wrapper.findWhere((n) => {
      return n.type() === Input && n.prop('id') === 'textvalue';
    });

    const ttl = wrapper.findWhere((n) => {
      return n.type() === SelectDNSSeconds && n.prop('id') === 'ttl';
    });

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
