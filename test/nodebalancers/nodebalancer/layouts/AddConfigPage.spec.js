import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { push } from 'react-router-redux';

import {
  expectDispatchOrStoreErrors,
  expectRequest,
  expectObjectDeepEquals,
} from '@/common';
import { genericNodeBalancer } from '@/data/nodebalancers';
import { AddConfigPage } from '~/nodebalancers/nodebalancer/layouts/AddConfigPage';

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
        nodebalancer={genericNodeBalancer}
        dispatch={dispatch}
      />
    );

    const changeInput = (id, value) =>
      page.find({ id, name: id }).props().onChange(
        { target: { value, checked: value, name: id } });

    changeInput('port', 82);
    changeInput('protocol', 'http');
    changeInput('algorithm', 'roundrobin');
    changeInput('stickiness', 'none');
    changeInput('check', 'none');
    changeInput('checkPassive', true);
    changeInput('checkInterval', 0);
    changeInput('checkTimeout', 30);
    changeInput('checkAttempts', 3);

    dispatch.reset();
    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/nodebalancers/${genericNodeBalancer.id}/configs/`, {
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
        pushResult, push(`/nodebalancers/${genericNodeBalancer.label}/configs/5`)),
    ], 2, [{ id: 5 }]);
  });

  it('commits changes to the API with HTTPS', async () => {
    const page = await mount(
      <AddConfigPage
        nodebalancer={genericNodeBalancer}
        dispatch={dispatch}
      />
    );

    const changeInput = (id, value) =>
      page.find({ id, name: id }).props().onChange(
        { target: { value, checked: value, name: id } });

    changeInput('port', 82);
    changeInput('protocol', 'https');
    changeInput('algorithm', 'roundrobin');
    changeInput('stickiness', 'none');
    changeInput('check', 'none');
    changeInput('checkPassive', true);
    changeInput('checkInterval', 0);
    changeInput('checkTimeout', 30);
    changeInput('checkAttempts', 3);
    changeInput('sslCert', 'Some ssl cert');
    changeInput('sslKey', 'Some ssl key');

    dispatch.reset();
    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/nodebalancers/${genericNodeBalancer.id}/configs/`, {
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
        pushResult, push(`/nodebalancers/${genericNodeBalancer.label}/configs/5`)),
    ], 2, [{ id: 5 }]);
  });
});
