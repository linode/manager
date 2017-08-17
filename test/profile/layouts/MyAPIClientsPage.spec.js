import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { API_ROOT } from '~/constants';
import { MyAPIClientsPage } from '~/profile/layouts/MyAPIClientsPage';

import { api } from '@/data';
import { expectRequest } from '@/common.js';


const { clients } = api;

describe('profile/layouts/MyAPIClientsPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of Clients', () => {
    const page = mount(
      <MyAPIClientsPage
        dispatch={dispatch}
        selectedMap={{}}
        clients={clients}
      />
    );

    const client = page.find('.TableRow');
    expect(client.length).to.equal(Object.keys(clients.clients).length);
    const firstClient = client.at(0);
    expect(firstClient.find('td img').props().src)
      .to.equal(`${API_ROOT}/account/clients/1/thumbnail`);
    expect(firstClient.find('td').at(2).text())
      .to.equal('My client');
    expect(firstClient.find('td').at(3).text())
      .to.equal('1');
    expect(firstClient.find('td').at(4).text())
      .to.equal('http://localhost:3000/oauth/callback');
  });

  it('deletes selected clients when delete is pressed', async () => {
    const page = mount(
      <MyAPIClientsPage
        dispatch={dispatch}
        selectedMap={{ 1: true }}
        clients={clients}
      />
    );

    dispatch.reset();

    const actions = page.find('MassEditControl').find('Dropdown').props().groups[0].elements;
    actions.find(a => a && a.name === 'Delete').action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() {} });
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/account/clients/1', { method: 'DELETE' });
  });
});
