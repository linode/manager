import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { RolesTableExpandedRow } from './RolesTableExpandedRow';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RolesTableExpandedRow', () => {
  it('renders when used', () => {
    renderWithProviders(<RolesTableExpandedRow permissions={[]} />);

    expect(screen.getByText('Permissions')).toBeVisible();
  });
});
