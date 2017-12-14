import React from 'react';
import { shallow } from 'enzyme';
import ConfigForm from './ConfigForm';
import { configsNodeBalancer } from '~/data/nodebalancers';

describe('components/ConfigForm', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <ConfigForm
        dispatch={mockDispatch}
        nodebalancer={configsNodeBalancer}
        config={configsNodeBalancer._configs.configs['1']}
        submitText="Submit"
        submitDisabledText="Disabled"
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
