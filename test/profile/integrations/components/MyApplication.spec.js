import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';

import { SHOW_MODAL } from '~/actions/modal';
import { API_ROOT } from '~/constants';
import MyApplication from '~/profile/integrations/components/MyApplication';
import { api } from '@/data';
import { expectRequest } from '@/common';

const { clients: { clients } } = api;

describe('profile/integrations/components/MyApplication', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a client', () => {
    const client = clients[1];
    const page = shallow(
      <MyApplication
        dispatch={dispatch}
        client={client}
      />
    );

    const cardProps = page.find('SecondaryCard').props();
    expect(cardProps.title).to.equal(client.label);
    expect(cardProps.icon).to.equal(`${API_ROOT}/account/clients/${client.id}/thumbnail`);

    expect(page.find('#clientId').text()).to.equal(client.id);
    expect(page.find('#redirect').text()).to.equal(client.redirect_uri);
  });

  it('opens the edit modal on edit click', () => {
    const client = clients[1];
    const page = mount(
      <MyApplication
        dispatch={dispatch}
        client={client}
      />
    );

    dispatch.reset();

    page.instance().editAction();
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0].type).to.equal(SHOW_MODAL);
  });

  it('should show modal on delete action', async () => {
    const client = clients[1];
    const page = mount(
      <MyApplication
        dispatch={dispatch}
        client={client}
      />
    );

    dispatch.reset();

    page.instance().deleteAction();
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(SHOW_MODAL);
  });

  it('should show modal on reset action', async () => {
    const client = clients[1];
    const page = mount(
      <MyApplication
        dispatch={dispatch}
        client={client}
      />
    );

    dispatch.reset();

    page.instance().deleteAction();
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(SHOW_MODAL);
  });

  it('should delete app', async () => {
    const client = clients[1];
    const page = mount(
      <MyApplication
        dispatch={dispatch}
        client={client}
      />
    );

    dispatch.reset();

    await page.instance().deleteApp();
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/account/clients/1', { method: 'DELETE' });
  });
});
