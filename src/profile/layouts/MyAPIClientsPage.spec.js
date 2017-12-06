import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { API_ROOT } from '~/constants';
import { MyAPIClientsPage } from '~/profile/layouts/MyAPIClientsPage';

import { api } from '~/data';
import { expectRequest } from '~/test.helpers.js';


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
    expect(client.length).toBe(Object.keys(clients.clients).length);
    const firstClient = client.at(0);
    expect(firstClient.find('td img').props().src)
      .toBe(`${API_ROOT}/account/oauth-clients/1/thumbnail`);
    expect(firstClient.find('td').at(2).text())
      .toBe('My client');
    expect(firstClient.find('td').at(3).text())
      .toBe('1');
    expect(firstClient.find('td').at(4).text())
      .toBe('http://localhost:3000/oauth/callback');
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
    await expectRequest(fn, '/account/oauth-clients/1', { method: 'DELETE' });
  });
});
