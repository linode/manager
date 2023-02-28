import * as React from 'react';
import UserMenu from './UserMenu';
import { renderWithTheme } from 'src/utilities/testHelpers';

it('renders without crashing', async () => {
  const { getByRole } = renderWithTheme(<UserMenu />);

  const button = getByRole('button');

  expect(button).toBeInTheDocument();
});
