import { screen } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import UserMenu from './UserMenu';

it('renders without crashing', () => {
  renderWithTheme(<UserMenu />);
  expect(screen.queryByText('My Profile')).not.toBeNull();
});
