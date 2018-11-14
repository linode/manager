import { shallow } from 'enzyme';
import * as React from 'react';

import Notice from 'src/components/Notice';

import { AutoEnroll } from './AutoEnroll';

const props = {
  enabled: true,
  error: undefined,
  toggle: jest.fn(),
  classes: {
    root: '', header: '', toggleLabel: '', toggleLabelText: '',
  }
}

const component = shallow(
  <AutoEnroll {...props} />
)

describe("AutoEnroll display component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });
  it("should render its error prop", () => {
    component.setProps({ error: "Error"});
    expect(component.containsMatchingElement(
      <Notice error text="Error" />
    )).toBeTruthy();
  });
  it("should toggle the enabled value on click", () => {
    component.find('[data-qa-enable-toggle]').simulate('click');
    expect(props.toggle).toHaveBeenCalled();
  });
  it("should reflect the enabled state (passed from Redux)", () => {
    expect(component.find('WithStyles(LinodeSwitchControl)').props()).toHaveProperty('checked', true);
    component.setProps({ enabled: false });
    expect(component.find('WithStyles(LinodeSwitchControl)').props()).toHaveProperty('checked', false);
  });
});