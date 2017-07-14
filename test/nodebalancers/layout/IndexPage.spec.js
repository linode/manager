import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { IndexPage } from '~/nodebalancers/layouts/IndexPage';

import { api } from '@/data';
import { expectRequest } from '@/common.js';


const { nodebalancers } = api;

describe('nodebalancers/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of Nodebalancers', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        nodebalancers={nodebalancers}
      />
    );

    const zone = page.find('.TableRow');
    // + 1 for the group
    expect(zone.length).to.equal(Object.keys(nodebalancers.nodebalancers).length);
    const firstZone = zone.at(0);
    expect(firstZone.find('Link').props().to)
      .to.equal('/nodebalancers/nodebalancer-2');
    expect(firstZone.find('td').at(1).text())
      .to.equal('nodebalancer-2');
    expect(firstZone.find('td').at(2).text())
      .to.equal('1.1.1.1');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        nodebalancers={nodebalancers}
      />
    );

    const zoneDelete = page.find('.TableRow Button').at(0);
    dispatch.reset();
    zoneDelete.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('deletes selected nodebalancers when delete is pressed', async () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{ 1: true }}
        nodebalancers={nodebalancers}
      />
    );

    dispatch.reset();

    page.find('tr button').at(0).simulate('click');
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() {} });
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/nodebalancers/23', { method: 'DELETE' });
  });
});
