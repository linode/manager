import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { RolesTableActionMenu } from './RolesTableActionMenu';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RolesTableActionMenu', () => {
  it('renders when used', () => {
    renderWithProviders(
      <RolesTableActionMenu canUpdateUserGrants={true} onClick={() => {}} />
    );

    expect(
      screen.getByText('Assign Role').closest('cds-button')
    ).toBeInTheDocument();
  });
});
