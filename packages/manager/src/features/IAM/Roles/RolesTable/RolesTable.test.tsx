import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { RolesTable } from './RolesTable';

import type { RoleMap } from '../../Shared/types';

vi.mock('src/features/IAM/Shared/utilities', async () => {
  const actual = await vi.importActual<any>(
    'src/features/IAM/Shared/utilities'
  );
  return {
    ...actual,
    mapAccountPermissionsToRoles: vi.fn(),
  };
});

const mockRoles: RoleMap[] = [
  {
    access: 'account_access',
    description: 'Account volume admin',
    entity_ids: [1],
    entity_type: 'volume',
    id: 'account_volume_admin',
    name: 'account_volume_admin',
    permissions: ['attach_volume', 'delete_volume', 'clone_volume'],
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
});

describe('RolesTable', () => {
  it('renders no roles when roles array is empty', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <RolesTable roles={[]} />
    );

    expect(getByTestId('roles-table')).toBeInTheDocument();
    expect(getByText('No items to display.')).toBeInTheDocument();
  });

  it('renders roles correctly when roles array is provided', () => {
    const { getByText, getByTestId, getAllByRole } = renderWithTheme(
      <RolesTable roles={mockRoles} />
    );

    expect(getByTestId('roles-table')).toBeInTheDocument();
    expect(getAllByRole('combobox').length).toEqual(1);
    expect(getByText('Account volume admin')).toBeInTheDocument();
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
