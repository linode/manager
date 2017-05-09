import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { noGroupNodeBalancer, genericNodeBalancer } from '@/data/nodebalancers';
import { IndexPage } from '~/nodebalancers/nodebalancer/layouts/IndexPage';

describe('nodebalancers/nodebalancer/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders the nodebalancer label and group', () => {
    // TODO: test for group when supported by API
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        nodebalancer={genericNodeBalancer}
        params={{ configId: genericNodeBalancer._configs.configs[2].id }}
      />);
    const { label } = genericNodeBalancer;
    const h1 = page.find('h1');
    expect(h1.text()).to.equal(label);
  });

  it('renders the nodebalancer label alone when ungrouped', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        nodebalancer={noGroupNodeBalancer}
        params={{ configId: noGroupNodeBalancer._configs.configs[2].id }}
      />);

    const h1 = page.find('h1');
    expect(h1.text()).to.equal(noGroupNodeBalancer.label);
  });
});
