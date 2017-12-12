import { mount, shallow } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import {
  createSimulatedEvent,
  expectDispatchOrStoreErrors,
  expectRequest,
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

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <SettingsPage
        dispatch={dispatch}
        nodebalancer={configsNodeBalancer}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders display page', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        nodebalancer={configsNodeBalancer}
      />
    );

    expect(page.find('input#client_conn_throttle').props().value)
      .toBe(configsNodeBalancer.client_conn_throttle);
    expect(page.find('input#label').props().value).toBe(configsNodeBalancer.label);
  });

  it('makes request to save changes', async () => {
    const page = mount(
      <SettingsPage
        dispatch={dispatch}
        nodebalancer={configsNodeBalancer}
      />
    );

    dispatch.reset();
    page.find('Form').simulate('submit', { preventDefault() { } });
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

    page.find('input[name="label"]')
      .simulate('change', createSimulatedEvent('label', 'newlabel'));

    dispatch.reset();

    await page.find('Form').simulate('submit', { preventDefault() { } });

    const fn = dispatch.firstCall.args[0];
    await expectDispatchOrStoreErrors(fn, [
      null,
      ([pushResult]) => expect(pushResult)
        .toEqual(push('/nodebalancers/newlabel/settings')),
    ]);
  });
});
