import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { push } from 'react-router-redux';

import { expectRequest, expectObjectDeepEquals } from '@/common';
import { genericNodeBalancer } from '@/data/nodebalancers';
import { EditConfigPage } from '~/nodebalancers/nodebalancer/configs/layouts/EditConfigPage';

describe('nodebalancers/nodebalancer/layouts/EditConfigPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('commits changes to the API', async () => {
    const id = 1;
    const page = await mount(
      <EditConfigPage
        id={id}
        nodebalancer={genericNodeBalancer}
        config={genericNodeBalancer._configs.configs[id]}
        dispatch={dispatch}
      />
    );

    const changeInput = (id, value) =>
      page.find({ id, name: id }).props().onChange({
        target: {
          value,
          checked: value,
          name: id,
        },
      });

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
    expect(dispatch.callCount).to.equal(2);
    const fn = dispatch.firstCall.args[0];
    const testPath = `/nodebalancers/${genericNodeBalancer.id}/configs/${id}`;
    await expectRequest(fn, testPath, {
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
        check: 'none',
      },
    });

    expectObjectDeepEquals(
      dispatch.secondCall.args[0],
      push(`/nodebalancers/${genericNodeBalancer.label}`));
  });
});
