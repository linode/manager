import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { StaticRouter } from 'react-router-dom';
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
      <StaticRouter>
        <IndexPage
          dispatch={dispatch}
          nodebalancer={configsNodeBalancer}
          params={{}}
        />
      </StaticRouter>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders the nodebalancer label and group', () => {
    // TODO: test for group when supported by API
    const page = mount(
      <StaticRouter>
        <IndexPage
          dispatch={dispatch}
          nodebalancer={configsNodeBalancer}
          params={{}}
        />
      </StaticRouter>
    );
    const { label } = configsNodeBalancer;
    const h1 = page.find('h1');
    expect(h1.text()).toBe(label);
  });

  it('renders the nodebalancer label alone when ungrouped', () => {
    const page = mount(
      <StaticRouter>
        <IndexPage
          dispatch={dispatch}
          nodebalancer={noGroupNodeBalancer}
          params={{}}
        />
      </StaticRouter>
    );

    const h1 = page.find('h1');
    expect(h1.text()).toBe(noGroupNodeBalancer.label);
  });
});
