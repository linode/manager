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
  it('should render a table of access keys', async () => {
    const { getByTestId } = renderWithTheme(<AccessKeyLanding {...props} />);
    expect(getByTestId('data-qa-access-key-table')).toBeInTheDocument();
  });
});
