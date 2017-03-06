import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { push } from 'react-router-redux';

import { expectRequest, expectObjectDeepEquals } from '@/common';
import { api } from '@/data';
import { AddConfigPage } from '~/nodebalancers/nodebalancer/layouts/AddConfigPage';

const { nodebalancers } = api;

describe('nodebalancers/nodebalancer/AddConfigPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('commits changes to the API', async () => {
    const nbLabel = 'nodebalancer-1';
    const nodebalancer = nodebalancers.nodebalancers[0];
    const page = await mount(
      <AddConfigPage
        nbLabel={nbLabel}
        nodebalancer={nodebalancer}
        dispatch={dispatch}
      />
    );
    const changeInput = (id, value) =>
    page.find({ id, name: id }).props().onChange({ target: { value,
                                                 checked: value,
                                                 name: id,
    } });
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
    await expectRequest(
      fn, `/nodebalancers/${nodebalancer.id}/configs/`,
      { method: 'POST',
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
      }
    );

    expectObjectDeepEquals(
      dispatch.secondCall.args[0],
      push(`/nodebalancers/${nbLabel}`)
    );
  });
});

