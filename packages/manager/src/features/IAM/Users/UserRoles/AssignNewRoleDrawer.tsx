import { Autocomplete, Drawer, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import { useAccountPermissions } from 'src/queries/iam/iam';

import { AssignedPermissionsPanel } from '../../Shared/AssignedPermissionsPanel/AssignedPermissionsPanel';
import { getAllRoles, getRoleByName } from '../../Shared/utilities';

import type { RolesType } from '../../Shared/utilities';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const AssignNewRoleDrawer = ({ onClose, open }: Props) => {
  const [
    selectedOptions,
    setSelectedOptions,
  ] = React.useState<RolesType | null>(null);

  const {
    data: accountPermissions,
    isLoading: accountPermissionsLoading,
  } = useAccountPermissions();

  const allRoles = React.useMemo(() => {
    if (!accountPermissions) {
      return [];
    }

    return getAllRoles(accountPermissions);
  }, [accountPermissions]);

  // Get the selected role based on the `selectedOptions`
  const selectedRole = React.useMemo(() => {
    if (!selectedOptions || !accountPermissions) {
      return null;
    }
    return getRoleByName(accountPermissions, selectedOptions.value);
  }, [selectedOptions, accountPermissions]);

  // TODO - add a link 'Learn more" - UIE-8534
  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Assign New Roles"
    >
      <Typography sx={{ marginBottom: 2.5 }}>
        Select a role you want to assign to a user. Some roles require selecting
        resources they should apply to. Configure the first role and continue
        adding roles or save the assignment.
        <Link to=""> Learn more about roles and permissions.</Link>
      </Typography>

      <Autocomplete
        renderOption={(props, option) => (
          <li {...props} key={option.label}>
            {option.label}
          </li>
        )}
        label="Assign New Roles"
        loading={accountPermissionsLoading}
        onChange={(_, value) => setSelectedOptions(value)}
        options={allRoles}
        placeholder="Select a Role"
        textFieldProps={{ hideLabel: true, noMarginTop: true }}
        value={selectedOptions}
      />

      {selectedRole && (
        <AssignedPermissionsPanel key={selectedRole.name} role={selectedRole} />
      )}
    </Drawer>
  );
};
