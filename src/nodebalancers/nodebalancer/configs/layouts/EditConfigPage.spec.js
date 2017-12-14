import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

import {
  createSimulatedEvent,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';
import { configsNodeBalancer } from '~/data/nodebalancers';
import { EditConfigPage } from '~/nodebalancers/nodebalancer/configs/layouts/EditConfigPage';

describe('nodebalancers/nodebalancer/configs/layouts/EditConfigPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <EditConfigPage
        id="1"
        nodebalancer={configsNodeBalancer}
        config={configsNodeBalancer._configs.configs[1]}
        dispatch={dispatch}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });


  it('commits changes to the API', async () => {
    const id = 1;
    const page = mount(
      <EditConfigPage
        id={id}
        nodebalancer={configsNodeBalancer}
        config={configsNodeBalancer._configs.configs[id]}
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
      .simulate('change', createSimulatedEvent('stickiness', 'none'));
    page.find('select[name="check"]')
      .simulate('change', createSimulatedEvent('check', 'http_body'));
    page.find('input[name="checkPath"]')
      .simulate('change', createSimulatedEvent('checkPath', '/'));
    page.find('input[name="checkBody"]')
      .simulate('change', createSimulatedEvent('checkBody', 'foo'));
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
      ([fn]) => expectRequest(fn, `/nodebalancers/${configsNodeBalancer.id}/configs/${id}`, {
        method: 'PUT',
        body: {
          check_timeout: 30,
          check_attempts: 3,
          check_interval: 0,
          protocol: 'http',
          algorithm: 'roundrobin',
          stickiness: 'none',
          check_passive: true,
          port: 82,
          check: 'http_body',
          check_body: 'foo',
          check_path: '/',
        },
      }),
    ], 1, [{ id: 1 }]);
  });

  it('commits changes to the API with HTTPS', async () => {
    const id = 1;
    const page = await mount(
      <EditConfigPage
        id={id}
        nodebalancer={configsNodeBalancer}
        config={configsNodeBalancer._configs.configs[id]}
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
      ([fn1]) => expectRequest(fn1, `/nodebalancers/${configsNodeBalancer.id}/configs/${id}/ssl`, {
        method: 'POST',
        body: {
          ssl_cert: 'Some ssl cert',
          ssl_key: 'Some ssl key',
        },
      }),
      ([fn2]) => expectRequest(fn2, `/nodebalancers/${configsNodeBalancer.id}/configs/${id}`, {
        method: 'PUT',
        body: {
          check_timeout: 30,
          check_attempts: 3,
          check_interval: 0,
          protocol: 'https',
          algorithm: 'roundrobin',
          stickiness: 'none',
          check_passive: true,
          port: 82,
          check: 'none',
          check_path: '',
          check_body: '',
        },
      }),
    ], 2, [undefined, { id: 1 }]);
  });
});
