import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserMenu } from './UserMenu';

it('renders without crashing', () => {
  const { getByRole } = renderWithTheme(<UserMenu />);
  expect(getByRole('button')).toBeInTheDocument();
});
