vi.mock('src/OAuth/oauthClient', () => ({
  getIsAdminToken: vi.fn(),
  oauthClient: {},
}));

import { screen } from '@testing-library/react';
import React from 'react';

import { createUserRoles } from '../../factories';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { AssignedEntitiesTableBody } from './AssignedEntitiesTableBody';

import type { EntitiesRole } from '../types';

beforeAll(() => mockMatchMedia());

const defaultHandlers = {
  handleChangeRole: vi.fn(),
  handleRemoveAssignment: vi.fn(),
};

const defaultPermissions = {
  is_account_admin: true,
  update_default_delegate_access: true,
};

describe('AssignedEntitiesTableBody', () => {
  it('renders loading state', () => {
    renderWithProviders(
      <table>
        <tbody>
          <AssignedEntitiesTableBody
            assignedRoles={undefined}
            entities={undefined}
            entitiesError={null}
            entitiesLoading={true}
            error={null}
            filteredRoles={[]}
            loading={false}
            paginatedData={[]}
            permissions={defaultPermissions}
            {...defaultHandlers}
          />
        </tbody>
      </table>
    );

    expect(screen.getByTestId('table-row-loading')).toBeVisible();
  });

  it('renders error state', () => {
    renderWithProviders(
      <table>
        <tbody>
          <AssignedEntitiesTableBody
            assignedRoles={undefined}
            entities={undefined}
            entitiesError={new Error('fail')}
            entitiesLoading={false}
            error={null}
            filteredRoles={[]}
            loading={false}
            paginatedData={[]}
            permissions={defaultPermissions}
            {...defaultHandlers}
          />
        </tbody>
      </table>
    );

    expect(screen.getByTestId('table-row-error')).toBeVisible();
    expect(
      screen.getByText(
        'Unable to load the assigned entities. Please try again.'
      )
    ).toBeVisible();
  });

  it('renders empty state', () => {
    renderWithProviders(
      <table>
        <tbody>
          <AssignedEntitiesTableBody
            assignedRoles={createUserRoles()}
            entities={[]}
            entitiesError={null}
            entitiesLoading={false}
            error={null}
            filteredRoles={[]}
            loading={false}
            paginatedData={[]}
            permissions={defaultPermissions}
            {...defaultHandlers}
          />
        </tbody>
      </table>
    );

    expect(screen.getByTestId('table-row-empty')).toBeVisible();
    expect(screen.getByText('No items to display.')).toBeVisible();
  });

  it('renders entity rows', () => {
    const assignment: EntitiesRole = {
      access: 'entity_access',
      entity_id: 1,
      entity_name: 'no_devices',
      entity_type: 'firewall',
      id: 'firewall-1-firewall_admin',
      role_name: 'firewall_admin',
    };

    renderWithProviders(
      <table>
        <tbody>
          <AssignedEntitiesTableBody
            assignedRoles={createUserRoles()}
            entities={[{ id: 1, label: 'no_devices', type: 'firewall' }]}
            entitiesError={null}
            entitiesLoading={false}
            error={null}
            filteredRoles={[assignment]}
            loading={false}
            paginatedData={[assignment]}
            permissions={defaultPermissions}
            {...defaultHandlers}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('no_devices')).toBeVisible();
    expect(screen.getByText('Firewall')).toBeVisible();
    expect(screen.getByText('firewall_admin')).toBeVisible();
  });
});
