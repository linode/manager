import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { configsNodeBalancer } from '@/data/nodebalancers';
import NodeModal from '~/nodebalancers/nodebalancer/configs/components/NodeModal';

const node = configsNodeBalancer._configs.configs['1']._nodes.nodes[1];

describe('nodebalancers/nodebalancer/configs/components/NodeModal', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders node modal with data', () => {
    const page = mount(
      <NodeModal
        dispatch={dispatch}
        confirmTest="Edit"
        configId="1"
        nodebalancerId="23"
        node={node}
      />
    );

    expect(page.find('#label').props().value).to.equal('greatest_node_ever');
    expect(page.find('#address').props().value).to.equal('192.168.4.5:80');
    expect(page.find('#weight').props().value).to.equal(40);
    expect(page.find('#mode').props().value).to.equal('accept');
  });

  it('updates node', async () => {
    const page = mount(
      <NodeModal
        dispatch={dispatch}
        confirmTest="Edit"
        configId="1"
        nodebalancerId="23"
        node={node}
      />
    );

    dispatch.reset();
    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/nodebalancers/23/configs/1/nodes/${node.id}`, {
        method: 'PUT',
        body: {
          label: 'greatest_node_ever',
          address: '192.168.4.5:80',
          weight: 40,
          mode: 'accept',
        },
      }),
    ], 2);
  });

  it('creates node', async () => {
    const page = mount(
      <NodeModal
        dispatch={dispatch}
        confirmTest="Edit"
        configId="1"
        nodebalancerId="23"
      />
    );

    changeInput(page, 'label', 'myLabel');
    changeInput(page, 'address', '192.168.4.6:88');
    changeInput(page, 'weight', '50');

    dispatch.reset();
    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/nodebalancers/23/configs/1/nodes/', {
        method: 'POST',
        body: {
          label: 'myLabel',
          address: '192.168.4.6:88',
          weight: 50,
          mode: 'accept',
        },
      }),
    ], 2);
  });
});
