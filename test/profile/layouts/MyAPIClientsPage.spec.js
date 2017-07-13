import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';

import { SHOW_MODAL } from '~/actions/modal';
import { MyAPIClientsPage } from '~/profile/layouts/MyAPIClientsPage';
import { api } from '@/data';
import { expectObjectDeepEquals } from '@/common';

const { clients } = api;

describe('profile/layouts/MyAPIClientsPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of clients', () => {
    const page = mount(
      <MyAPIClientsPage
        dispatch={dispatch}
        clients={clients}
      />
    );

    const myApplications = page.find('MyApplication');
    expect(myApplications.length).to.equal(Object.keys(clients.clients).length);
    const firstClient = myApplications.at(0);
    expectObjectDeepEquals(firstClient.props().client, clients.clients[1]);
  });

  it('opens the add modal on add click', () => {
    const page = shallow(
      <MyAPIClientsPage
        dispatch={dispatch}
        clients={clients}
      />
    );

    const button = page.find('Button');
    button.props().onClick();

    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0].type).to.equal(SHOW_MODAL);
  });
});
