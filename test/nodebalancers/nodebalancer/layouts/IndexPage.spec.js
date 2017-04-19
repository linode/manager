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
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        nodebalancer={genericNodeBalancer}
      />);

    const { group, label } = genericNodeBalancer;
    const h1Link = page.find('h1 Link');
    expect(h1Link.props().to).to.equal(`/nodebalancers/${label}`);
    expect(h1Link.props().children).to.equal(`${group} / ${label}`);
  });

  it('renders the nodebalancer label alone when ungrouped', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        nodebalancer={noGroupNodeBalancer}
      />);

    const h1Link = page.find('h1 Link');
    expect(h1Link.props().to).to.equal(`/nodebalancers/${noGroupNodeBalancer.label}`);
    expect(h1Link.text()).to.equal(noGroupNodeBalancer.label);
  });
});
