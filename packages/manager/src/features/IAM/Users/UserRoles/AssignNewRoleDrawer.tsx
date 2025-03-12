import { ActionsPanel, Drawer, Typography } from '@linode/ui';
import React, { useState } from 'react';

import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { NotFound } from 'src/components/NotFound';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { AssignSingleRole } from 'src/features/IAM/Users/UserRoles/AssignSingleRole';
import { useAccountPermissions } from 'src/queries/iam/iam';

import { getAllRoles } from '../../Shared/utilities';

import type { RolesType } from '../../Shared/utilities';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const AssignNewRoleDrawer = ({ onClose, open }: Props) => {
  const { data: accountPermissions } = useAccountPermissions();

  const allRoles = React.useMemo(() => {
    if (!accountPermissions) {
      return [];
    }
    return getAllRoles(accountPermissions);
  }, [accountPermissions]);

  const [selectedRoles, setSelectedRoles] = useState<(RolesType | null)[]>([
    null,
  ]);

  const handleChangeRole = (index: number, value: RolesType | null) => {
    const updatedRoles = [...selectedRoles];
    updatedRoles[index] = value;
    setSelectedRoles(updatedRoles);
  };

  const addRole = () => setSelectedRoles([...selectedRoles, null]);

  const handleRemoveRole = (index: number) => {
    const updatedRoles = selectedRoles.filter((_, i) => i !== index);
    setSelectedRoles(updatedRoles);
  };

  const removeAllRoles = () => setSelectedRoles([null]);

  const handleSubmit = () => {
    // TODO - make this really do something apart from console logging - UIE-8590
    // eslint-disable-next-line no-console
    console.log(
      'Selected Roles:',
      selectedRoles.filter((role) => role)
    );
    handleClose();
  };

  const handleClose = () => {
    removeAllRoles();
    onClose();
  };

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

      {!!accountPermissions &&
        selectedRoles.map((role, index) => (
          <AssignSingleRole
            index={index}
            key={role ? role.label : `${index}`}
            onChange={handleChangeRole}
            onRemove={handleRemoveRole}
            options={allRoles}
            permissions={accountPermissions}
            selectedOption={selectedRoles[index]}
          />
        ))}

      {/* If all roles are filled, allow them to add another */}
      {selectedRoles.every((role) => role !== null) && (
        <StyledLinkButtonBox
          sx={(theme) => ({ marginTop: theme.spacing(1.5) })}
        >
          <LinkButton onClick={addRole}>Add another role</LinkButton>
        </StyledLinkButtonBox>
      )}

      <ActionsPanel
        primaryButtonProps={{
          label: 'Assign',
          onClick: handleSubmit,
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: handleClose,
        }}
      />
    </Drawer>
  );
};
