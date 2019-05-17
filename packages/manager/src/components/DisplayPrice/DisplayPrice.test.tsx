import { shallow } from 'enzyme';
import * as React from 'react';

import Typography from 'src/components/core/Typography';

import { DisplayPrice, displayPrice } from './DisplayPrice';

const classes = {
  root: '',
  price: '',
  per: ''
};

const component = shallow(<DisplayPrice price={100} classes={classes} />);

describe('DisplayPrice component', () => {
  it('should format the price prop correctly', () => {
    expect(displayPrice(0)).toEqual('$0.00');
    expect(displayPrice(1.1)).toEqual('$1.10');
    expect(displayPrice(100)).toEqual('$100.00');
  });
  it('should not display an interval unless specified', () => {
    expect(component.find('WithStyles(Typography)')).toHaveLength(1);
  });
  it('should display the interval when specified', () => {
    component.setProps({ interval: 'mo' });
    expect(component.find('WithStyles(Typography)')).toHaveLength(2);
    expect(
      component.containsMatchingElement(<Typography>/mo</Typography>)
    ).toBeTruthy();
  });
  it('should render a Currency component with the price', () => {
    expect(component.find('[data-qa-currency-component]')).toHaveLength(1);
    expect(
      component.find('[data-qa-currency-component]').prop('quantity')
    ).toBe(100);
  });
});
