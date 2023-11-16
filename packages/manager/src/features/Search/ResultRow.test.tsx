import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { searchbarResult1 } from 'src/__data__/searchResults';
import { wrapWithTableBody } from 'src/utilities/testHelpers';

import { ResultRow } from './ResultRow';

const classes = {
  createdCell: '',
  labelCell: '',
  link: '',
  regionCell: '',
  root: '',
  tag: '',
  tagCell: '',
};

const props = {
  classes,
  openDomainDrawerForEditing: vi.fn(),
  redirect: vi.fn(),
  result: searchbarResult1,
};

describe('ResultRow component', () => {
  render(wrapWithTableBody(<ResultRow {...props} />));
  it('should render', () => {
    expect(screen.getByText('result1')).toBeInTheDocument();
  });
});
