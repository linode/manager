import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { expectRequest } from '@/common';
import EditSOARecord from '~/dnsmanager/components/EditSOARecord';

describe('dnsmanager/components/EditSOARecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders fields correctly', () => {
    const currentZone = api.dnszones.dnszones['1'];
    const page = mount(
      <EditSOARecord
        dispatch={dispatch}
        zone={currentZone}
        close={() => {}}
      />
    );

    const zone = page.find('#zone');
    expect(zone.props().value).to.equal(currentZone.dnszone);

    const group = page.find('#group');
    expect(group.props().value).to.equal(currentZone.display_group);

    const email = page.find('#email');
    expect(email.props().value).to.equal(currentZone.soa_email);

    const defaultTTL = page.find('#defaultTTL');
    expect(defaultTTL.props().value).to.equal(currentZone.ttl_sec.toString());

    const refreshRate = page.find('#refreshRate');
    expect(refreshRate.props().value).to.equal(currentZone.refresh_sec.toString());

    const retryRate = page.find('#retryRate');
    expect(retryRate.props().value).to.equal(currentZone.retry_sec.toString());

    const expireTime = page.find('#expireTime');
    expect(expireTime.props().value).to.equal(currentZone.expire_sec.toString());
  });

  it('submits data onsubmit and closes modal', async () => {
    const currentZone = api.dnszones.dnszones['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditSOARecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    const changeInput = (name, value) =>
      page.instance().setState({ [name]: value });

    changeInput('zone', 'tester1234.com');
    changeInput('group', 'tester-zones');
    changeInput('email', 'admin@tester1234.com');
    changeInput('defaultTTL', 3600);
    changeInput('refreshRate', 3600);
    changeInput('retryRate', 3600);
    changeInput('expireTime', 3600);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expect(close.callCount).to.equal(1);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/dns/zones/${currentZone.id}`, undefined, undefined, {
      method: 'PUT',
      body: {
        dnszone: 'tester1234.com',
        display_group: 'tester-zones',
        soa_email: 'admin@tester1234.com',
        ttl_sec: 3600,
        refresh_sec: 3600,
        retry_sec: 3600,
        expire_sec: 3600,
      },
    });
  });
});
