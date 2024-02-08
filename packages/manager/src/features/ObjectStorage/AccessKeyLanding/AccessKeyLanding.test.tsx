import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessKeyLanding } from './AccessKeyLanding';

const props = {
  accessDrawerOpen: false,
  closeAccessDrawer: vi.fn(),
  isRestrictedUser: false,
  mode: 'creating' as any,
  openAccessDrawer: vi.fn(),
};

describe('AccessKeyLanding', () => {
  it('should render a table of access keys', () => {
    renderWithTheme(<AccessKeyLanding {...props} />);
    expect(screen.getByTestId('data-qa-access-key-table')).toBeInTheDocument();
  });
});
