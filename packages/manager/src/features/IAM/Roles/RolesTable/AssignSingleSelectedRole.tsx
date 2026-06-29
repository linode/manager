import { Spacing } from '@akamai/cds-tokens';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { AssignedPermissionsPanel } from 'src/features/IAM/Shared/AssignedPermissionsPanel/AssignedPermissionsPanel';
import { Divider } from 'src/features/IAM/Shared/Divider/Divider';

import { Box } from '../../Shared/Box/Box';

import type { RoleView } from 'src/features/IAM/Shared/types';
import type { AssignNewRoleFormValues } from 'src/features/IAM/Shared/utilities';

interface Props {
  hideDetails: boolean;
  index: number;
  role: RoleView;
}

export const AssignSingleSelectedRole = ({
  hideDetails,
  index,
  role,
}: Props) => {
  const { control } = useFormContext<AssignNewRoleFormValues>();

  return (
    <Box>
      <Box style={{ flex: '5 1 auto' }}>
        {index !== 0 && (
          <Divider spacingBottom={Spacing.S6} spacingTop={Spacing.S12} />
        )}

        {!!role && (
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
                role={role}
                showName={true}
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
    </Box>
  );
};
