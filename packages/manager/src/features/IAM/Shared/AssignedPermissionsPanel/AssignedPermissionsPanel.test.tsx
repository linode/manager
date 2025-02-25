import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedPermissionsPanel } from './AssignedPermissionsPanel';

import type {
  IamAccessType,
  ResourceTypePermissions,
  Roles,
} from '@linode/api-v4/lib/iam/types';
import type { IamAccountResource } from '@linode/api-v4/lib/resources/types';

interface ExtendedRole extends Roles {
  access: IamAccessType;
  resource_type: ResourceTypePermissions;
}

const queryMocks = vi.hoisted(() => ({
  useAccountResources: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/resources/resources', async () => {
  const actual = await vi.importActual('src/queries/resources/resources');
  return {
    ...actual,
    useAccountResources: queryMocks.useAccountResources,
  };
});

const mockAccountAcceessRole: ExtendedRole = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all linode instances in the account',
  name: 'account_retail_owner',
  permissions: ['cancel_account'],
  resource_type: 'account',
};

const mockResourcesAcceessRole: ExtendedRole = {
  access: 'resource_access',
  description: 'Access to administer a image instance',
  name: 'image_admin',
  permissions: [
    'create_image',
    'upload_image',
    'list_images',
    'view_image',
    'update_image',
    'delete_image',
  ],
  resource_type: 'image',
};

const mockResources: IamAccountResource[] = [
  {
    resource_type: 'linode',
    resources: [
      {
        id: 23456789,
        name: 'linode-uk-123',
      },
      {
        id: 456728,
        name: 'db-us-southeast1',
      },
    ],
  },
  {
    resource_type: 'image',
    resources: [
      { id: 3, name: 'image-1' },
      { id: 4, name: 'image-2' },
    ],
  },
];

describe('AssignedPermissionsPanel', () => {
  it('renders with the correct context when the access is an account', () => {
    const { getByText } = renderWithTheme(
      <AssignedPermissionsPanel role={mockAccountAcceessRole} />
    );
    expect(
      getByText(
        'Access to perform any supported action on all linode instances in the account'
      )
    ).toBeInTheDocument();
    expect(getByText('cancel_account')).toBeInTheDocument();
    expect(getByText('All entities')).toBeInTheDocument();
  });

  it('does not render Autocomplete when the access is an account', () => {
    const { getByText, queryAllByRole } = renderWithTheme(
      <AssignedPermissionsPanel role={mockAccountAcceessRole} />
    );
    const autocomplete = queryAllByRole('combobox');

    expect(getByText('Entities')).toBeInTheDocument();
    expect(getByText('All entities')).toBeInTheDocument();

    // check that the autocomplete doesn't exist
    expect(autocomplete.length).toBe(0);
    expect(autocomplete[0]).toBeUndefined();
  });

  it('renders with the correct context when the access is a resource', () => {
    queryMocks.useAccountResources.mockReturnValue({ data: mockResources });

    const { getAllByRole, getAllByTestId, getByText } = renderWithTheme(
      <AssignedPermissionsPanel role={mockResourcesAcceessRole} />
    );

    const permissions = getAllByTestId('permission');
    expect(permissions).toHaveLength(6);

    expect(
      getByText('Access to administer a image instance')
    ).toBeInTheDocument();
    expect(getByText('create_image')).toBeInTheDocument();
    expect(getByText('Entities')).toBeInTheDocument();

    const autocomplete = getAllByRole('combobox');
    expect(autocomplete).toHaveLength(1);
    expect(autocomplete[0]).toBeInTheDocument();
    expect(autocomplete[0]).toHaveAttribute('placeholder', 'Select Images');
  });

  it('renders the Autocomplete when the access is a resource', () => {
    queryMocks.useAccountResources.mockReturnValue({ data: mockResources });

    const { getAllByRole, getByText } = renderWithTheme(
      <AssignedPermissionsPanel role={mockResourcesAcceessRole} />
    );

    // Verify comboboxes exist
    const autocomplete = getAllByRole('combobox')[0];
    fireEvent.focus(autocomplete);
    fireEvent.mouseDown(autocomplete);
    expect(getByText('image-1')).toBeInTheDocument();
    expect(getByText('image-2')).toBeInTheDocument();
  });

  it('shows all permissions', () => {
    const { getAllByTestId } = renderWithTheme(
      <AssignedPermissionsPanel role={mockResourcesAcceessRole} />
    );

    // All chips should now be visible
    const visibleChips = getAllByTestId('permission');
    expect(visibleChips.length).toBe(
      mockResourcesAcceessRole.permissions.length
    );
  });
});
