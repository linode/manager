import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { IndexPage } from '~/domains/layouts/IndexPage';
import { api } from '@/data';
import { expectRequest } from '@/common.js';
import { SHOW_MODAL } from '~/actions/modal';

const { domains } = api;

describe('domains/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of Domains', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        domains={domains}
      />
    );

    const zone = page.find('.TableRow');
    // + 1 for the group
    expect(zone.length).to.equal(Object.keys(domains.domains).length);
    const firstZone = zone.at(0);
    expect(firstZone.find('Link').props().to)
      .to.equal('/domains/example.com');
    expect(firstZone.find('td').at(1).text())
      .to.equal('example.com');
    expect(firstZone.find('td').at(2).text())
      .to.equal('Master');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        domains={domains}
      />
    );

    const zoneDelete = page.find('.TableRow Button').at(0);
    dispatch.reset();
    zoneDelete.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('deletes selected domains when delete is pressed', async () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{ 1: true }}
        domains={domains}
      />
    );

    dispatch.reset();

    const actions = page.find('Dropdown').props().groups[0].elements;
    actions.find(a => a && a.name === 'Delete').action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() {} });
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/domains/1', { method: 'DELETE' });
  });
});
