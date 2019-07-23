import { shallow } from 'enzyme';
import * as React from 'react';

import { searchbarResult1, searchbarResult2 } from 'src/__data__/searchResults';
import Tags from 'src/components/Tags';
import { ResultRow } from './ResultRow';

const classes = {
  root: '',
  description: '',
  label: '',
  icon: '',
  resultBody: '',
  rowContent: '',
  iconTableCell: '',
  tag: '',
  link: '',
  status: '',
  labelRow: '',
  labelCell: '',
  iconGridCell: '',
  regionCell: '',
  createdCell: '',
  tagCell: ''
};

const props = {
  result: searchbarResult1,
  redirect: jest.fn(),
  classes
};

const component = shallow(<ResultRow {...props} />);

describe('ResultRow component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should render tags if any', () => {
    component.setProps({ result: searchbarResult2 });
    expect(
      component.containsMatchingElement(
        <Tags tags={searchbarResult2.data.tags} />
      )
    ).toBeTruthy();
  });
});
