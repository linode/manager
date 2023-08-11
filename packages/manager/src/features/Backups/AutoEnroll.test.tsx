import { shallow } from 'enzyme';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';

import { AutoEnroll } from './AutoEnroll';

const props = {
  enabled: true,
  error: undefined,
  toggle: jest.fn(),
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
