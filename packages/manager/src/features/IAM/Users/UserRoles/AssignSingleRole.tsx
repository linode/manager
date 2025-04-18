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

  const { control } = useFormContext<AssignNewRoleFormValues>();

  return (
    <Box display="flex">
      <Box display="flex" flexDirection="column" sx={{ flex: '5 1 auto' }}>
        {index !== 0 && (
          <Divider
            sx={{
              marginBottom: theme.tokens.spacing.S12,
            }}
          />
        )}

        <Controller
          control={control}
          name={`roles.${index}`}
          render={({ field: { onChange, value } }) => (
            <>
              <Autocomplete
                label="Assign New Roles"
                onChange={(event, newValue) => {
                  onChange({
                    ...value,
                    role: newValue,
                  });
                }}
                options={options}
                placeholder="Select a Role"
                textFieldProps={{ hideLabel: true }}
                value={value?.role || null}
              />
              {value?.role && !hideDetails && (
                <AssignedPermissionsPanel
                  mode="assign-role"
                  onChange={(updatedEntities) => {
                    onChange({
                      ...value,
                      entities: updatedEntities,
                    });
                  }}
                  role={getRoleByName(permissions, value.role?.value)!}
                  value={value.entities || []}
                />
              )}
            </>
          )}
        />
      </Box>
      <Box
        sx={{
          flex: '0 1 auto',
          marginTop:
            index === 0 ? -theme.tokens.spacing.S4 : theme.tokens.spacing.S16,
          verticalAlign: 'top',
        }}
      >
        <Button disabled={index === 0} onClick={() => onRemove(index)}>
          <DeleteIcon />
        </Button>
      </Box>
    </Box>
  );
};
