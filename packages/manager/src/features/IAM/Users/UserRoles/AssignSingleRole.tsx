import { Autocomplete, Button, DeleteIcon } from '@linode/ui';
import { Divider, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { AssignedPermissionsPanel } from 'src/features/IAM/Shared/AssignedPermissionsPanel/AssignedPermissionsPanel';
import { getRoleByName } from 'src/features/IAM/Shared/utilities';

import type { IamAccountPermissions } from '@linode/api-v4';
import type {
  AssignNewRoleFormValues,
  RolesType,
} from 'src/features/IAM/Shared/utilities';

interface Props {
  hideDetails: boolean;
  index: number;
  onRemove: (idx: number) => void;
  options: RolesType[];
  permissions: IamAccountPermissions;
}

export const AssignSingleRole = ({
  index,
  onRemove,
  options,
  permissions,
  hideDetails,
}: Props) => {
  const theme = useTheme();

  const { control, watch, setValue } =
    useFormContext<AssignNewRoleFormValues>();
  const role = watch(`roles.${index}.role`);
  const roles = watch('roles');

  return (
    <Box display="flex">
      <Box display="flex" flexDirection="column" sx={{ flex: '5 1 auto' }}>
        {index !== 0 && (
          <Divider
            sx={{
              marginBottom: theme.tokens.spacing.S24,
              marginTop: theme.tokens.spacing.S20,
            }}
          />
        )}

        <Controller
          control={control}
          name={`roles.${index}.role`}
          render={({ field: { onChange, value }, fieldState }) => (
            <Autocomplete
              errorText={fieldState.error?.message}
              label="Assign New Roles"
              onChange={(event, newValue) => {
                onChange(newValue);
                setValue(`roles.${index}.entities`, null);
              }}
              options={options}
              placeholder="Select a Role"
              textFieldProps={{ hideLabel: true }}
              value={value || null}
            />
          )}
          rules={{
            validate: (value) => {
              if (!value) {
                return roles.length === 1
                  ? 'Select a role.'
                  : 'Select a role or remove this entry.';
              }
              return true;
            },
          }}
        />

        {role && (
          <Controller
            control={control}
            name={`roles.${index}.entities`}
            render={({ field: { onChange, value }, fieldState }) => (
              <AssignedPermissionsPanel
                errorText={fieldState.error?.message}
                hideDetails={hideDetails}
                mode="assign-role"
                onChange={(updatedEntities) => {
                  onChange(updatedEntities);
                }}
                role={getRoleByName(permissions, role?.value)!}
                value={value || []}
              />
            )}
            rules={{
              validate: (value) => {
                if (role.access === 'account_access') return true;
                if (
                  role.access === 'entity_access' &&
                  (!value || value.length === 0)
                ) {
                  return 'Select entities.';
                }
                return true;
              },
            }}
          />
        )}
      </Box>
      <Box
        sx={{
          flex: '0 1 auto',
          marginTop:
            index === 0
              ? `-${theme.tokens.spacing.S2}`
              : theme.tokens.spacing.S40,
          paddingTop: index === 0 ? undefined : theme.tokens.spacing.S4,
          verticalAlign: 'top',
        }}
      >
        <Button disabled={roles.length === 1} onClick={() => onRemove(index)}>
          <DeleteIcon />
        </Button>
      </Box>
    </Box>
  );
};
