import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedPermissionsPanel } from './AssignedPermissionsPanel';

import type {
  EntityTypePermissions,
  IamAccessType,
  Roles,
} from '@linode/api-v4/lib/iam/types';

interface ExtendedRole extends Roles {
  access: IamAccessType;
  entity_type: EntityTypePermissions;
}

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual('src/queries/entities/entities');
  return {
    ...actual,
    useAccountEntities: queryMocks.useAccountEntities,
  };
});

const mockAccountAcceessRole: ExtendedRole = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all linode instances in the account',
  entity_type: 'account',
  name: 'account_retail_owner',
  permissions: ['cancel_account'],
};

const mockEntitiesAcceessRole: ExtendedRole = {
  access: 'entity_access',
  description: 'Access to administer a image instance',
  entity_type: 'image',
  name: 'image_admin',
  permissions: [
    'create_image',
    'upload_image',
    'list_images',
    'view_image',
    'update_image',
    'delete_image',
  ],
};

const mockEntities = [
  accountEntityFactory.build({
    id: 1,
    label: 'image-1',
    type: 'image',
  }),
];

describe('AssignedPermissionsPanel', () => {
  it('renders with the correct context when the access is an account', () => {
    renderWithTheme(
      <AssignedPermissionsPanel
        mode="assign-role"
        role={mockAccountAcceessRole}
      />
    );
    screen.getByText('All entities');
    screen.getByText(
      'Access to perform any supported action on all linode instances in the account'
    );
    screen.getByText('cancel_account');
    screen.getByText('Description');
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

  it('renders with the correct context when the access is an entity', () => {
    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });
    const { getAllByRole, getAllByTestId, getByText } = renderWithTheme(
      <AssignedPermissionsPanel role={mockEntitiesAcceessRole} />
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

  it('renders the Autocomplete when the access is an entity', () => {
    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });
    const { getAllByRole, getByText } = renderWithTheme(
      <AssignedPermissionsPanel role={mockEntitiesAcceessRole} />
    );

    // Verify comboboxes exist
    const autocomplete = getAllByRole('combobox')[0];
    fireEvent.focus(autocomplete);
    fireEvent.mouseDown(autocomplete);
    expect(getByText('image-1')).toBeInTheDocument();
  });

  it('shows all permissions', () => {
    const { getAllByTestId } = renderWithTheme(
      <AssignedPermissionsPanel role={mockEntitiesAcceessRole} />
    );

    // All chips should now be visible
    const visibleChips = getAllByTestId('permission');
    expect(visibleChips.length).toBe(
      mockEntitiesAcceessRole.permissions.length
    );
  });

  it('does not render the Entities component when mode is "change-role-for-entity"', () => {
    renderWithTheme(
      <AssignedPermissionsPanel
        mode="change-role-for-entity"
        role={mockEntitiesAcceessRole}
      />
    );

    // Verify that the Entities component is not rendered
    expect(screen.queryByText('Entities')).not.toBeInTheDocument();
  });
});
