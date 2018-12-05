import { shallow } from 'enzyme';
import * as React from 'react';

import { searchbarResult1, searchbarResult2 } from 'src/__data__/searchResults';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import TableRowLoading from 'src/components/TableRowLoading';

import { ResultGroup } from './ResultGroup';

const classes = { root: '', entityHeadingWrapper: '', entityHeading: '', button: '', emptyCell: '', headerCell: ''};

const props = {
  entity: 'linodes',
  classes,
  results: [
    searchbarResult1,
    searchbarResult2,
    searchbarResult1,
    searchbarResult2,
    searchbarResult1,
    searchbarResult2,
  ],
  loading: false,
  groupSize: 5,
  showMore: false,
  toggle: jest.fn(),
}

const emptyProps = {
  entity: 'linodes',
  classes,
  results: [],
  loading: false,
  groupSize: 5,
  showMore: false,
  toggle: jest.fn(),
}

const component = shallow(
  <ResultGroup {...props} />
)

describe("ResultGroup component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });
  it("should return null if there are no results", () => {
    expect(ResultGroup(emptyProps)).toBeNull();
  });
  it("should render the capitalized entity label", () => {
    expect(component.containsMatchingElement(
      <Typography >
        Linodes
      </Typography>
    )).toBeTruthy();
  });
  it("should render its children", () => {
    expect(component.find('[data-qa-result-row]')).toHaveLength(5);
  });
  it("should render a loading spinner", () => {
    component.setProps({ loading: true });
    expect(component.containsMatchingElement(
      <TableRowLoading colSpan={12} />
    )).toBeTruthy();
  });
  describe("Hidden results", () => {
    it("should have a Show All button", () => {
      expect(component.containsMatchingElement(
        <Button type="primary">Show All</Button>
      ));
    });
    it("should show hidden results when showMore is true", () => {
      component.setProps({ showMore: true });
      expect(component.find('[data-qa-result-row]')).toHaveLength(6);
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
});