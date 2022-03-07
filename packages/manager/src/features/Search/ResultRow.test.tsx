import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { searchbarResult1 } from 'src/__data__/searchResults';
import { wrapWithTableBody } from 'src/utilities/testHelpers';

import { ResultRow } from './ResultRow';

const classes = {
  root: '',
  labelCell: '',
  regionCell: '',
  createdCell: '',
  tagCell: '',
  tag: '',
  link: '',
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
