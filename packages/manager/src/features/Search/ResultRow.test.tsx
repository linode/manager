import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { searchbarResult1 } from 'src/__data__/searchResults';
import { wrapWithTableBody } from 'src/utilities/testHelpers';

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
  labelCellCMR: '',
};

const props = {
  result: searchbarResult1,
  redirect: jest.fn(),
  openDomainDrawerForEditing: jest.fn(),
  classes,
};

describe('ResultRow component', () => {
  render(wrapWithTableBody(<ResultRow {...props} />));
  it('should render', () => {
    expect(screen.getByText('result1')).toBeInTheDocument();
  });
});
