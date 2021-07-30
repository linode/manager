import * as React from 'react';
import { pageyProps } from 'src/__data__/pageyProps';
import { AccessKeyLanding } from './AccessKeyLanding';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { screen } from '@testing-library/react';

const props = {
  classes: {
    headline: '',
    paper: '',
    helperText: '',
    labelCell: '',
    createdCell: '',
    confirmationDialog: '',
  },
  isRestrictedUser: false,
  accessDrawerOpen: false,
  openAccessDrawer: jest.fn(),
  closeAccessDrawer: jest.fn(),
  mode: 'creating' as any,
  ...pageyProps,
};

describe('AccessKeyLanding', () => {
  it('should render a table of access keys', () => {
    renderWithTheme(<AccessKeyLanding {...props} />);
    expect(screen.getByTestId('data-qa-access-key-table')).toBeInTheDocument();
  });
});
