import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme, resizeScreenSize } from 'src/utilities/testHelpers';

import { RolesTable } from './RolesTable';

import type { RoleView } from '../../Shared/types';

const queryMocks = vi.hoisted(() => ({
  usePermissions: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('src/features/IAM/Shared/utilities', async () => {
  const actual = await vi.importActual('src/features/IAM/Shared/utilities');
  return {
    ...actual,
    mapAccountPermissionsToRoles: vi.fn(),
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', async () => {
  const actual = await vi.importActual('src/features/IAM/hooks/usePermissions');
  return {
    ...actual,
    usePermissions: vi.fn().mockReturnValue({}),
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: queryMocks.useSearch,
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
  resizeScreenSize(1200);
});

describe('RolesTable', () => {
  beforeEach(() => {
    queryMocks.useSearch.mockReturnValue({
      query: '',
    });
  });

  it('renders no roles when roles array is empty', async () => {
    renderWithTheme(<RolesTable roles={[]} />);

    screen.getByTestId('roles-table');
    screen.getByText('No items to display.');
  });

  it('renders roles correctly when roles array is provided', async () => {
    const { getAllByRole } = renderWithTheme(<RolesTable roles={mockRoles} />);

    screen.getByTestId('roles-table');
    expect(getAllByRole('combobox').length).toEqual(1);
    screen.getByText('Account linode admin');
  });

  it('filters roles to warranted results based on search input', async () => {
    queryMocks.useSearch.mockReturnValue({
      query: 'Account',
    });

    renderWithTheme(<RolesTable roles={mockRoles} />);

    const searchInput: HTMLInputElement = screen.getByPlaceholderText('Search');

    screen.getByTestId('roles-table');

    expect(searchInput.value).toBe('Account');
    expect(screen.queryByText('Database')).not.toBeInTheDocument();
    expect(screen.queryByText('No items to display.')).not.toBeInTheDocument();
  });

  it('filters roles to no results based on search input if warranted', async () => {
    queryMocks.useSearch.mockReturnValue({
      query: 'NonsenseThatWontMatchAnything',
    });

    renderWithTheme(<RolesTable roles={mockRoles} />);

    const searchInput: HTMLInputElement = screen.getByPlaceholderText('Search');

    screen.getByTestId('roles-table');
    expect(searchInput.value).toBe('NonsenseThatWontMatchAnything');
    screen.getByText('No items to display.');
  });
});
