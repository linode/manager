import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import {
  changeInput, expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest,
} from '~/test.helpers';
import { configsNodeBalancer } from '~/data/nodebalancers';
import { SettingsPage } from '~/nodebalancers/nodebalancer/layouts/SettingsPage';


describe('nodebalancers/nodebalancer/layouts/SettingsPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders display page', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        nodebalancer={configsNodeBalancer}
      />
    );

    expect(page.find({ id: 'client_conn_throttle' }).props().value)
      .toBe(configsNodeBalancer.client_conn_throttle);
    expect(page.find({ id: 'label' }).props().value).toBe(configsNodeBalancer.label);
  });

  it('makes request to save changes', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        nodebalancer={configsNodeBalancer}
      />
    );

    dispatch.reset();
    page.find('Form').simulate('submit', { preventDefault() {} });
    const fn = dispatch.firstCall.args[0];

    await expectDispatchOrStoreErrors(fn, [
      ([fn]) => expectRequest(fn, `/nodebalancers/${configsNodeBalancer.id}`, {
        method: 'PUT',
        body: {
          client_conn_throttle: configsNodeBalancer.client_conn_throttle,
          label: configsNodeBalancer.label,
        },
      }),
    ]);
  });

  it('redirects if the label changed', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        nodebalancer={configsNodeBalancer}
      />
    );

    changeInput(page, 'label', 'newlabel');

    dispatch.reset();

    await page.find('Form').simulate('submit', { preventDefault() {} });

    const fn = dispatch.firstCall.args[0];
    await expectDispatchOrStoreErrors(fn, [
      null,
      ([pushResult]) => expectObjectDeepEquals(
        pushResult,
        push('/nodebalancers/newlabel/settings')),
    ]);
  });
});
