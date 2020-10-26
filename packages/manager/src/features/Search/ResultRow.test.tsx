import * as React from 'react';
import { searchbarResult1 } from 'src/__data__/searchResults';
import { renderWithTheme } from 'src/utilities/testHelpers';

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
  tagCell: '',
  linkCMR: '',
  preCMRCell: '',
  labelCellCMR: ''
};

const props = {
  result: searchbarResult1,
  redirect: jest.fn(),
  openDomainDrawerForEditing: jest.fn(),
  classes
};

// const propsWithTags = {
//   result: searchbarResult2,
//   redirect: jest.fn(),
//   openDomainDrawerForEditing: jest.fn(),
//   classes
// }

const component = renderWithTheme(<ResultRow {...props} />);

// const { getByTestId } = renderWithTheme(<ResultRow {...propsWithTags} />);

describe('ResultRow component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  // it('should render tags if any', () => {
  //   expect(getByTestId('result-tags')).toBeDefined();
  // });
});
