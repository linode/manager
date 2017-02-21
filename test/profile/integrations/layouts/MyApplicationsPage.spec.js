import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { MyApplicationsPage } from '~/profile/integrations/layouts/MyApplicationsPage';
import { api } from '@/data';
import { expectObjectDeepEquals } from '@/common';

const { clients } = api;

describe('profile/integrations/layouts/MyApplicationsPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of clients', () => {
    const page = shallow(
      <MyApplicationsPage
        dispatch={dispatch}
        clients={clients}
      />
    );

    const myApplications = page.find('MyApplication');
    expect(myApplications.length).to.equal(Object.keys(clients.clients).length);
    const firstClient = myApplications.at(0);
    expectObjectDeepEquals(firstClient.props().client, clients.clients[1]);
  });
});
