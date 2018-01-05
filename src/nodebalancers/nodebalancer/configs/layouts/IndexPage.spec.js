import React from 'react';
import { shallow } from 'enzyme';
import { IndexPage } from './IndexPage';
import { configsNodeBalancer } from '~/data/nodebalancers';

describe('components/IndexPage', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <IndexPage
        dispatch={mockDispatch}
        nodebalancer={configsNodeBalancer}
        config={configsNodeBalancer._configs.configs['1']}
      >
        <div></div>
      </IndexPage>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
