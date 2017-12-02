import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { push } from 'react-router-redux';

import { AddConfigPage } from '~/nodebalancers/nodebalancer/layouts/AddConfigPage';

import {
  changeInput,
  createSimulatedEvent,
  expectDispatchOrStoreErrors,
  expectRequest,
  expectObjectDeepEquals,
} from '~/test.helpers';
import { configsNodeBalancer } from '~/data/nodebalancers';


describe('nodebalancers/nodebalancer/layouts/AddConfigPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('commits changes to the API', async () => {
    const page = await mount(
      <AddConfigPage
        nodebalancer={configsNodeBalancer}
        dispatch={dispatch}
      />
    );

    page.find('input[name="port"]')
      .simulate('change', createSimulatedEvent('port', 82));
    page.find('select[name="protocol"]')
      .simulate('change', createSimulatedEvent('protocol', 'http'));
    page.find('select[name="algorithm"]')
      .simulate('change', createSimulatedEvent('algorithm', 'roundrobin'));
    page.find('select[name="stickiness"]')
      .simulate('change', createSimulatedEvent('stickiness','none'));
    page.find('select[name="check"]')
      .simulate('change', createSimulatedEvent('check', 'none'));
    page.find('input[name="checkPassive"]')
      .simulate('change', createSimulatedEvent('checkPassive', true));
    page.find('input[name="checkInterval"]')
      .simulate('change', createSimulatedEvent('checkInterval', 0));
    page.find('input[name="checkTimeout"]')
      .simulate('change', createSimulatedEvent('checkTimeout', 30));
    page.find('input[name="checkAttempts"]')
      .simulate('change', createSimulatedEvent('checkAttempts', 3));

    dispatch.reset();
    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/nodebalancers/${configsNodeBalancer.id}/configs/`, {
        method: 'POST',
        body: {
          check_timeout: 30,
          check_attempts: 3,
          check_interval: 0,
          protocol: 'http',
          algorithm: 'roundrobin',
          stickiness: 'none',
          check_passive: true,
          port: 82,
          check: 'none',
          check_path: '',
          check_body: '',
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(
        pushResult, push(`/nodebalancers/${configsNodeBalancer.label}/configs/5`)),
    ], 2, [{ id: 5 }]);
  });

  it('commits changes to the API with HTTPS', async () => {
    const page = await mount(
      <AddConfigPage
        nodebalancer={configsNodeBalancer}
        dispatch={dispatch}
      />
    );

    page.find('input[name="port"]')
      .simulate('change', createSimulatedEvent('port', 82));
    page.find('select[name="protocol"]')
      .simulate('change', createSimulatedEvent('protocol', 'https'));
    page.find('select[name="algorithm"]')
      .simulate('change', createSimulatedEvent('algorithm', 'roundrobin'));
    page.find('select[name="stickiness"]')
      .simulate('change', createSimulatedEvent('stickiness', 'none'));
    page.find('select[name="check"]')
      .simulate('change', createSimulatedEvent('check', 'none'));
    page.find('input[name="checkPassive"]')
      .simulate('change', createSimulatedEvent('checkPassive', true));
    page.find('input[name="checkInterval"]')
      .simulate('change', createSimulatedEvent('checkInterval', 0));
    page.find('input[name="checkTimeout"]')
      .simulate('change', createSimulatedEvent('checkTimeout', 30));
    page.find('input[name="checkAttempts"]')
      .simulate('change', createSimulatedEvent('checkAttempts', 3));
    page.find('textarea[name="sslCert"]')
      .simulate('change', createSimulatedEvent('sslCert', 'Some ssl cert'));
    page.find('textarea[name="sslKey"]')
      .simulate('change', createSimulatedEvent('sslKey', 'Some ssl key'));

    dispatch.reset();
    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/nodebalancers/${configsNodeBalancer.id}/configs/`, {
        method: 'POST',
        body: {
          check_timeout: 30,
          check_attempts: 3,
          check_interval: 0,
          check_path: '',
          check_body: '',
          protocol: 'https',
          algorithm: 'roundrobin',
          stickiness: 'none',
          check_passive: true,
          port: 82,
          check: 'none',
          ssl_cert: 'Some ssl cert',
          ssl_key: 'Some ssl key',
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(
        pushResult, push(`/nodebalancers/${configsNodeBalancer.label}/configs/5`)),
    ], 2, [{ id: 5 }]);
  });
});
