import { shallow } from 'enzyme';
import * as React from 'react';

import { searchbarResult1, searchbarResult2 } from 'src/__data__/searchResults';

import { ResultRow, RowWithHandlers } from './ResultRow';

const classes = {
  root: '',
  description: '',
  label: '',
  icon: '',
  resultBody: '',
  rowContent: '',
  tableCell: '',
  tag: '',
};

const handleClick = jest.fn();

const props = {
  result: searchbarResult1,
  redirect: jest.fn(),
  classes
}

const component = shallow(
  <ResultRow handleClick={handleClick} {...props} />
)

const handlers = shallow(
  <RowWithHandlers {...props} />
)

describe("ResultRow component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });
  it("should redirect on click", () => {
    component.simulate('click');
    expect(handleClick).toHaveBeenCalled();
  });
  it("should render tags if any", () => {
    expect(component.find('[data-qa-tag-item]')).toHaveLength(0);
    component.setProps({ result: searchbarResult2 });
    expect(component.find('[data-qa-tag-item]')).toHaveLength(searchbarResult2.data.tags.length);
  });
  it("should redirect to the result's path", () => {
    handlers.find(ResultRow).props().handleClick();
    expect(props.redirect).toHaveBeenCalledWith(searchbarResult2.data.path);
  });
});