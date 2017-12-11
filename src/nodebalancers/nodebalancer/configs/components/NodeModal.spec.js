import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

import {
  createSimulatedEvent,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';
import { configsNodeBalancer } from '~/data/nodebalancers';
import NodeModal from '~/nodebalancers/nodebalancer/configs/components/NodeModal';

const node = configsNodeBalancer._configs.configs['1']._nodes.nodes[1];

describe('nodebalancers/nodebalancer/configs/components/NodeModal', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <NodeModal
        dispatch={dispatch}
        confirmTest="Edit"
        configId="1"
        nodebalancerId="23"
        node={node}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

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

    expect(page.find('input#label').props().value).toBe('greatest_node_ever');
    expect(page.find('input#address').props().value).toBe('192.168.4.5:80');
    expect(page.find('input#weight').props().value).toBe(40);
    expect(page.find('select#mode').props().value).toBe('accept');
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
    expect(dispatch.callCount).toBe(1);
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

    page.find('input#label')
      .simulate('change', createSimulatedEvent('label', 'myLabel'));
    page.find('input#address')
      .simulate('change', createSimulatedEvent('address', '192.168.4.6:88'));
    page.find('input#weight')
      .simulate('change', createSimulatedEvent('weight', '50'));

    dispatch.reset();
    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).toBe(1);
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
