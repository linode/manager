import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditCAARecord from '~/domains/components/EditCAARecord';

import {
  createSimulatedEvent,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';
import { api } from '~/data';

describe('domains/components/EditCAARecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[7];
    const wrapper = shallow(
      <EditCAARecord
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders fields correctly for CAA record', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[7];
    const page = mount(
      <EditCAARecord
        dispatch={() => { }}
        zone={currentZone}
        id={currentRecord.id}
        close={() => { }}
      />
    );

    const tag = page.find('select#tag');
    expect(tag.props().value).toBe(currentRecord.tag);

    const target = page.find('input#target');
    expect(target.props().value).toBe(currentRecord.target);

    const name = page.find('input#name');
    expect(name.props().value).toBe(currentRecord.name);

    const ttl = page.find('select#ttl');
    expect(+ttl.props().value).toBe(currentRecord.ttl_sec || currentZone.ttl_sec);
  });

  it('submits data onsubmit and closes modal for CAA record', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[7];
    const close = sandbox.spy();
    const page = mount(
      <EditCAARecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );


    page.find('select#tag')
      .simulate('change', createSimulatedEvent('tag', 'issue'));

    page.find('input#target')
      .simulate('change', createSimulatedEvent('target', 'certsign.ro'));

    page.find('input#name')
      .simulate('change', createSimulatedEvent('name', 'www.mysite.com'));

    page.find('select#ttl')
      .simulate('change', createSimulatedEvent('ttl', 3600));

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          tag: 'issue',
          target: 'certsign.ro',
          type: 'CAA',
          name: 'www.mysite.com',
          ttl_sec: 3600,
        },
      }),
    ]);
  });

  it('creates a new CAA record and closes the modal', async () => {
    const dispatch = sandbox.spy();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditCAARecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    page.find('select#tag')
      .simulate('change', createSimulatedEvent('tag', 'iodef'));

    page.find('input#target')
      .simulate('change', createSimulatedEvent('target', 'shenanigans.co'));

    page.find('input#name')
      .simulate('change', createSimulatedEvent('name', 'www.my-other-site.com'));

    page.find('select#ttl')
      .simulate('change', createSimulatedEvent('ttl', 0));

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          tag: 'iodef',
          target: 'shenanigans.co',
          name: 'www.my-other-site.com',
          ttl_sec: 0,
        },
      }),
    ]);
  });
});
