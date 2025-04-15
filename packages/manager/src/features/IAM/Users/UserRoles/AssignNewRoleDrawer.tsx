import { ActionsPanel, Drawer, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { NotFound } from 'src/components/NotFound';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { AssignSingleRole } from 'src/features/IAM/Users/UserRoles/AssignSingleRole';
import { useAccountPermissions } from 'src/queries/iam/iam';

import { getAllRoles } from '../../Shared/utilities';

import type { AssignNewRoleFormValues } from '../../Shared/utilities';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const AssignNewRoleDrawer = ({ onClose, open }: Props) => {
  const theme = useTheme();

  const { data: accountPermissions } = useAccountPermissions();

  const form = useForm<AssignNewRoleFormValues>({
    defaultValues: {
      roles: [
        {
          entities: null,
          role: null,
        },
      ],
    },
  });

  const { control, handleSubmit, reset, watch } = form;
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'roles',
  });

  // to watch changes to this value since we're conditionally rendering "Add another role"
  const roles = watch('roles');

  const allRoles = React.useMemo(() => {
    if (!accountPermissions) {
      return [];
    }
    return getAllRoles(accountPermissions);
  }, [accountPermissions]);

  const onSubmit = handleSubmit(async (values: AssignNewRoleFormValues) => {
    // TODO - make this really do something apart from console logging - UIE-8590

    // const selectedRoles = values.roles.map((r) => ({
    //   access: r.role?.access,
    //   entities: r.entities || null,
    //   role: r.role?.value,
    // }));
    handleClose();
  });

  const handleClose = () => {
    reset();

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
      {' '}
      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <Typography sx={{ marginBottom: 2.5 }}>
            Select a role you want to assign to a user. Some roles require
            selecting resources they should apply to. Configure the first role
            and continue adding roles or save the assignment.
            <Link to=""> Learn more about roles and permissions.</Link>
          </Typography>

          {!!accountPermissions &&
            fields.map((field, index) => (
              <AssignSingleRole
                index={index}
                key={field.id}
                onRemove={() => remove(index)}
                options={allRoles}
                permissions={accountPermissions}
              />
            ))}

          {/* If all roles are filled, allow them to add another */}
          {roles.length > 0 && roles.every((field) => field.role) && (
            <StyledLinkButtonBox sx={{ marginTop: theme.tokens.spacing.S12 }}>
              <LinkButton onClick={() => append({ role: null })}>
                Add another role
              </LinkButton>
            </StyledLinkButtonBox>
          )}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Assign',
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: handleClose,
            }}
          />
        </form>
      </FormProvider>
    </Drawer>
  );
};
