import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { API_ROOT } from '~/constants';
import MyApplication from '~/profile/components/MyApplication';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { clients } from '@/data/clients';


describe('profile/components/MyApplication', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a client', () => {
    const client = clients[1];
    const page = mount(
      <MyApplication
        dispatch={dispatch}
        client={client}
      />
    );

    const headerProps = page.find('CardImageHeader').props();

    expect(headerProps.title)
      .to.equal(client.label);
    expect(headerProps.icon)
      .to.equal(`${API_ROOT}/account/clients/${client.id}/thumbnail`);

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
    expect(dispatch.callCount).to.equal(1);
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
    expect(dispatch.callCount).to.equal(1);
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
    expect(dispatch.callCount).to.equal(1);

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/clients/1', { method: 'DELETE' }),
    ], 1);
  });
});
