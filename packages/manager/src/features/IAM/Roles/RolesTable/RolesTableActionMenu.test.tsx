import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { RolesTableActionMenu } from './RolesTableActionMenu';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RolesTableActionMenu', () => {
  it('renders when used', () => {
    renderWithTheme(<RolesTableActionMenu />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
