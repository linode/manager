import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

import { noGroupNodeBalancer, configsNodeBalancer } from '~/data/nodebalancers';
import { IndexPage } from '~/nodebalancers/nodebalancer/layouts/IndexPage';

describe('nodebalancers/nodebalancer/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <IndexPage
        dispatch={dispatch}
        nodebalancer={configsNodeBalancer}
        params={{}}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the nodebalancer label and group', () => {
    // TODO: test for group when supported by API
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        nodebalancer={configsNodeBalancer}
        params={{}}
      />
    );
    const { label } = configsNodeBalancer;
    const h1 = page.find('h1');
    expect(h1.text()).toBe(label);
  });

  it('renders the nodebalancer label alone when ungrouped', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        nodebalancer={noGroupNodeBalancer}
        params={{}}
      />);

    const h1 = page.find('h1');
    expect(h1.text()).toBe(noGroupNodeBalancer.label);
  });
});
