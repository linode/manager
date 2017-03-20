import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { IndexPage } from '~/dnsmanager/layouts/IndexPage';
import { api } from '@/data';
import Dropdown from '~/components/Dropdown';
import { expectRequest } from '@/common.js';
import { SHOW_MODAL } from '~/actions/modal';

const { dnszones } = api;

describe('dnsmanager/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of DNS Zones', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selected={{}}
        dnszones={dnszones}
      />
    );

    const zone = page.find('.TableRow');
    // + 1 for the group
    expect(zone.length).to.equal(Object.keys(dnszones.dnszones).length);
    const firstZone = zone.at(0);
    expect(firstZone.find('Link').props().to)
      .to.equal('/dnsmanager/example.com');
    expect(firstZone.find('td').at(1).text())
      .to.equal('example.com');
    expect(firstZone.find('td').at(2).text())
      .to.equal('master');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selected={{}}
        dnszones={dnszones}
      />
    );

    const zoneDelete = page.find('.TableRow Button').at(0);
    dispatch.reset();
    zoneDelete.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('deletes selected zones when delete is pressed', async () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selected={{ 1: true }}
        dnszones={dnszones}
      />
    );

    dispatch.reset();

    const actions = page.find(Dropdown).props().elements;
    actions.find(a => a.name === 'Delete').action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('.btn-default').simulate('click');
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/dns/zones/1', { method: 'DELETE' });
  });
});
