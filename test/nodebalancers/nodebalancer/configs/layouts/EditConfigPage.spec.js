import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { genericNodeBalancer } from '@/data/nodebalancers';
import { EditConfigPage } from '~/nodebalancers/nodebalancer/configs/layouts/EditConfigPage';

describe('nodebalancers/nodebalancer/configs/layouts/EditConfigPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('commits changes to the API', async () => {
    const id = 1;
    const page = mount(
      <EditConfigPage
        id={id}
        nodebalancer={genericNodeBalancer}
        config={genericNodeBalancer._configs.configs[id]}
        dispatch={dispatch}
      />
    );

    changeInput(page, 'port', 82);
    changeInput(page, 'protocol', 'http');
    changeInput(page, 'algorithm', 'roundrobin');
    changeInput(page, 'stickiness', 'none');
    changeInput(page, 'check', 'http_body');
    changeInput(page, 'checkPath', '/');
    changeInput(page, 'checkBody', 'foo');
    changeInput(page, 'checkPassive', true);
    changeInput(page, 'checkInterval', 0);
    changeInput(page, 'checkTimeout', 30);
    changeInput(page, 'checkAttempts', 3);

    dispatch.reset();
    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/nodebalancers/${genericNodeBalancer.id}/configs/${id}`, {
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
        nodebalancer={genericNodeBalancer}
        config={genericNodeBalancer._configs.configs[id]}
        dispatch={dispatch}
      />
    );

    changeInput(page, 'port', 82);
    changeInput(page, 'protocol', 'https');
    changeInput(page, 'algorithm', 'roundrobin');
    changeInput(page, 'stickiness', 'none');
    changeInput(page, 'check', 'none');
    changeInput(page, 'checkPassive', true);
    changeInput(page, 'checkInterval', 0);
    changeInput(page, 'checkTimeout', 30);
    changeInput(page, 'checkAttempts', 3);
    changeInput(page, 'sslCert', 'Some ssl cert');
    changeInput(page, 'sslKey', 'Some ssl key');

    dispatch.reset();
    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn1]) => expectRequest(fn1, `/nodebalancers/${genericNodeBalancer.id}/configs/${id}/ssl`, {
        method: 'POST',
        body: {
          ssl_cert: 'Some ssl cert',
          ssl_key: 'Some ssl key',
        },
      }),
      ([fn2]) => expectRequest(fn2, `/nodebalancers/${genericNodeBalancer.id}/configs/${id}`, {
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
