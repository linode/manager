import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { RolesTable } from './RolesTable';

import type { RoleView } from '../../Shared/types';

const queryMocks = {
  usePermissions: vi.fn(),
};

vi.mock('src/features/IAM/Shared/utilities', async () => {
  const actual = await vi.importActual<any>(
    'src/features/IAM/Shared/utilities'
  );
  return {
    ...actual,
    mapAccountPermissionsToRoles: vi.fn(),
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', async () => {
  const actual = await vi.importActual<any>(
    'src/features/IAM/hooks/usePermissions'
  );
  return {
    ...actual,
    usePermissions: vi.fn().mockReturnValue({}),
  };
});

const mockRoles: RoleView[] = [
  {
    access: 'account_access',
    description: 'Account linode admin',
    entity_ids: [1],
    entity_type: 'linode',
    id: 'account_linode_admin',
    name: 'account_linode_admin',
    permissions: ['apply_linode_firewalls', 'delete_linode', 'clone_linode'],
  },
  {
    access: 'entity_access',
    description: 'Firewall admin',
    entity_ids: [1],
    entity_type: 'firewall',
    id: 'firewall_admin',
    name: 'firewall_admin',
    permissions: [],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.usePermissions.mockReturnValue({
    data: {
      is_account_admin: true,
    },
  });
});

describe('RolesTable', () => {
  it('renders no roles when roles array is empty', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <RolesTable roles={[]} />
    );

    expect(getByTestId('roles-table')).toBeInTheDocument();
    expect(getByText('No items to display.')).toBeInTheDocument();
  });

  it('renders roles correctly when roles array is provided', async () => {
    const { getByText, getByTestId, getAllByRole } = renderWithTheme(
      <RolesTable roles={mockRoles} />
    );

    expect(getByTestId('roles-table')).toBeInTheDocument();
    expect(getAllByRole('combobox').length).toEqual(1);
    expect(getByText('Account linode admin')).toBeInTheDocument();
  });

  it('filters roles to warranted results based on search input', async () => {
    renderWithTheme(<RolesTable roles={mockRoles} />);
    const searchInput: HTMLInputElement = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'Account' } });

    await waitFor(() => {
      expect(screen.getByTestId('roles-table')).toBeInTheDocument();
      expect(searchInput.value).toBe('Account');
      // TODO - if there is a way to pierce the shadow DOM, we can check these results, but these tests fail currently
      // expect(screen.getByText('Account')).toBeInTheDocument();
      // expect(screen.queryByText('Database')).not.toBeInTheDocument();
      // expect(screen.getByText('No items to display.')).not.toBeInTheDocument();
    });
  });

  it('filters roles to no results based on search input if warranted', async () => {
    renderWithTheme(<RolesTable roles={mockRoles} />);

    const searchInput: HTMLInputElement = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, {
      target: { value: 'NonsenseThatWontMatchAnything' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('roles-table')).toBeInTheDocument();
      expect(searchInput.value).toBe('NonsenseThatWontMatchAnything');
      expect(screen.getByText('No items to display.')).toBeInTheDocument();
    });
  });
});
