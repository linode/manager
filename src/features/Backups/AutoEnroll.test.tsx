import { shallow } from 'enzyme';
import * as React from 'react';

import Notice from 'src/components/Notice';

import { AutoEnroll } from './AutoEnroll';

const props = {
  enabled: true,
  error: undefined,
  toggle: jest.fn(),
  classes: {
    root: '',
    header: '',
    icon: '',
    toggleLabel: '',
    toggleLabelText: ''
  }
};

const component = shallow(<AutoEnroll {...props} />);

describe('AutoEnroll display component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should render its error prop', () => {
    component.setProps({ error: 'Error' });
    expect(
      component.containsMatchingElement(<Notice error text="Error" />)
    ).toBeTruthy();
  });
});
