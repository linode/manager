import { screen } from '@testing-library/react';
import * as React from 'react';

import { pageyProps } from 'src/__data__/pageyProps';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessKeyLanding } from './AccessKeyLanding';

const props = {
  accessDrawerOpen: false,
  classes: {
    confirmationDialog: '',
    createdCell: '',
    headline: '',
    helperText: '',
    labelCell: '',
    paper: '',
  },
  closeAccessDrawer: jest.fn(),
  isRestrictedUser: false,
  mode: 'creating' as any,
  openAccessDrawer: jest.fn(),
  ...pageyProps,
};

describe('AccessKeyLanding', () => {
  it('should render a table of access keys', () => {
    renderWithTheme(<AccessKeyLanding {...props} />);
    expect(screen.getByTestId('data-qa-access-key-table')).toBeInTheDocument();
  });
});
