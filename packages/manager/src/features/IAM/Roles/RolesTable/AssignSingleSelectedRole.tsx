import { Divider, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { AssignedPermissionsPanel } from 'src/features/IAM/Shared/AssignedPermissionsPanel/AssignedPermissionsPanel';
import { RoleView } from 'src/features/IAM/Shared/types';

import type { IamAccountPermissions } from '@linode/api-v4';
import type { AssignNewRoleFormValues } from 'src/features/IAM/Shared/utilities';

interface Props {
  hideDetails: boolean;
  index: number;
  permissions: IamAccountPermissions;
  role: RoleView;
}

export const AssignSingleSelectedRole = ({
  hideDetails,
  index,
  permissions,
  role,
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
          render={({ field: { onChange, value } }) =>
            !!role && (
              <AssignedPermissionsPanel
                hideDetails={hideDetails}
                mode="assign-role"
                onChange={(updatedEntities) => {
                  onChange({
                    ...value,
                    entities: updatedEntities
                  });
                }}
                role={role}
                showName={true}
                value={[]}
              />
            )}
        />
      </Box>
    </Box>
  );
};
