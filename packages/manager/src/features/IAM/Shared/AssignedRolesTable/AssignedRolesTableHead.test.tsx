import { screen } from '@testing-library/react';
import React from 'react';

import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { AssignedRolesTableHead } from './AssignedRolesTableHead';

beforeAll(() => mockMatchMedia());

const defaultProps = {
  handleOrderChange: vi.fn(),
  order: 'asc' as const,
  orderBy: 'name' as const,
};

describe('AssignedRolesTableHead', () => {
  it('renders sortable role and entities column headers', () => {
    renderWithProviders(<AssignedRolesTableHead {...defaultProps} />);

    expect(screen.getByText('Role')).toBeVisible();
    expect(screen.getByText('Entities')).toBeVisible();
  });
});
