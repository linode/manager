import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { genericNodeBalancer } from '@/data/nodebalancers';
import {
  NodeModal,
} from '~/nodebalancers/nodebalancer/configs/components/NodeModal';

const node = genericNodeBalancer._configs.configs['0']._nodes.nodes[0];

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
        configId="0"
        nodebalancerId="23"
        node={node}
      />
    );

    expect(page.find('#label').props().value).to.equal('greatest_node_ever');
    expect(page.find('#address').props().value).to.equal('192.168.4.5');
    expect(page.find('#port').props().value).to.equal('80');
    expect(page.find('#weight').props().value).to.equal(40);
    expect(page.find('#mode').props().value).to.equal('accept');
  });
});
