vi.mock('src/OAuth/oauthClient', () => ({
  getIsAdminToken: vi.fn(),
  oauthClient: {},
}));

import { screen } from '@testing-library/react';
import React from 'react';

import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { AssignedEntitiesTableHead } from './AssignedEntitiesTableHead';

beforeAll(() => mockMatchMedia());

const defaultProps = {
  handleOrderChange: vi.fn(),
  order: 'asc' as const,
  orderBy: 'entity_name' as const,
};

describe('AssignedEntitiesTableHead', () => {
  it('renders sortable column headers', () => {
    renderWithProviders(<AssignedEntitiesTableHead {...defaultProps} />);

    expect(screen.getByText('Entity')).toBeVisible();
    expect(screen.getByText('Entity Type')).toBeVisible();
    expect(screen.getByText('Assigned Role')).toBeVisible();
  });
});
