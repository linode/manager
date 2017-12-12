import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditMXRecord from '~/domains/components/EditMXRecord';

import { createSimulatedEvent, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';

import { Input } from 'linode-components';

describe('domains/components/EditMXRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const wrapper = shallow(
      <EditMXRecord
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );
    const mailserver = wrapper.findWhere((a) => a.type() === Input
      && a.prop('id') === 'mailserver');
    const subdomain = wrapper.findWhere((a) => a.type() === Input && a.prop('id') === 'subdomain');
    const preference = wrapper.findWhere((a) => a.type() === Input
      && a.prop('id') === 'preference');

    expect(mailserver.props().value).toBe(currentRecord.target);
    expect(subdomain.props().value).toBe(currentRecord.name || currentZone.domain);
    expect(preference.props().value).toBe(currentRecord.priority);
  });

  it('submits data onsubmit and closes modal', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditMXRecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    const mailserver = wrapper.findWhere((a) => a.type() === Input
      && a.prop('id') === 'mailserver');
    const subdomain = wrapper.findWhere((a) => a.type() === Input && a.prop('id') === 'subdomain');
    const preference = wrapper.findWhere((a) => a.type() === Input
      && a.prop('id') === 'preference');

    mailserver.simulate('change', createSimulatedEvent('mailserver', 'mx1.tester1234.com'));
    subdomain.simulate('change', createSimulatedEvent('subdomain', 'tester1234.com'));
    preference.simulate('change', createSimulatedEvent('preference', 1));

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          target: 'mx1.tester1234.com',
          name: 'tester1234.com',
          priority: 1,
          type: 'MX',
        },
      }),
    ], 1);

    expect(close.callCount).toBe(1);
  });

  it('creates a new MX record and closes the modal', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const wrapper = shallow(
      <EditMXRecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const mailserver = wrapper.findWhere((a) => a.type() === Input
      && a.prop('id') === 'mailserver');
    const subdomain = wrapper.findWhere((a) => a.type() === Input && a.prop('id') === 'subdomain');
    const preference = wrapper.findWhere((a) => a.type() === Input
      && a.prop('id') === 'preference');

    mailserver.simulate('change', createSimulatedEvent('mailserver', 'mx1.tester1234.com'));
    subdomain.simulate('change', createSimulatedEvent('subdomain', 'tester1234.com'));
    preference.simulate('change', createSimulatedEvent('preference', 1));

    // changeInput(wrapper, 'mailserver', 'mx1.tester1234.com');
    // changeInput(wrapper, 'subdomain', 'tester1234.com');
    // changeInput(wrapper, 'preference', 1);

    await wrapper.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          target: 'mx1.tester1234.com',
          name: 'tester1234.com',
          priority: 1,
          type: 'MX',
        },
      }),
    ]);

    expect(close.callCount).toBe(1);
  });
});
