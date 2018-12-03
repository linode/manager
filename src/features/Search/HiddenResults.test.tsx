import { shallow } from 'enzyme';
import * as React from 'react';

import { searchbarResult1, searchbarResult2 } from 'src/__data__/searchResults';
import Button from 'src/components/Button';

import { HiddenResults } from './HiddenResults';

const redirect = jest.fn();
const results = [searchbarResult1, searchbarResult2];

const props = {
  results,
  showMore: false,
  toggle: jest.fn(),
  redirect,
  classes: { root: '', button: ''}
}

const component = shallow(
  <HiddenResults {...props} />
)

describe("Hidden results component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });
  it("should hide the results by default", () => {
    expect(component.find('[data-qa-result-row]')).toHaveLength(0);
  });
  it("should have a Show More button", () => {
    expect(component.containsMatchingElement(
      <Button type="primary">Show All</Button>
    ));
  });
  it("should show hidden results when showMore is true", () => {
    component.setProps({ showMore: true });
    expect(component.find('[data-qa-result-row]')).toHaveLength(2);
  });
  it("should have a Show Less button", () => {
    component.setProps({ showMore: true });
    expect(component.containsMatchingElement(
      <Button type="primary">Show Less</Button>
    )).toBeTruthy();
  });
  it("should toggle showMore on click", () => {
    component.find('[data-qa-show-more-toggle]').simulate('click');
    expect(props.toggle).toHaveBeenCalled();
  });
})