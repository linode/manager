import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { RolesTableExpandedRow } from './RolesTableExpandedRow';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RolesTableExpandedRow', () => {
  it('renders when used', () => {
    renderWithTheme(<RolesTableExpandedRow permissions={[]} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
