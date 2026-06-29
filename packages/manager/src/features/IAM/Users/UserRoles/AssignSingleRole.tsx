import { Button, Icon, Select, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { AssignedPermissionsPanel } from 'src/features/IAM/Shared/AssignedPermissionsPanel/AssignedPermissionsPanel';
import { getRoleByName } from 'src/features/IAM/Shared/utilities';

import { Box } from '../../Shared/Box/Box';
import { Divider } from '../../Shared/Divider/Divider';

import type { IamAccountRoles } from '@linode/api-v4';
import type {
  AssignNewRoleFormValues,
  RolesType,
} from 'src/features/IAM/Shared/utilities';

interface Props {
  hideDetails: boolean;
  index: number;
  onRemove: (idx: number) => void;
  options: RolesType[];
  permissions: IamAccountRoles;
}

export const AssignSingleRole = ({
  index,
  onRemove,
  options,
  permissions,
  hideDetails,
}: Props) => {
  const { control, watch, setValue } =
    useFormContext<AssignNewRoleFormValues>();
  const role = watch(`roles.${index}.role`);
  const roles = watch('roles');

  return (
    <Box direction="row" wrap="nowrap">
      <Box style={{ flex: '5 1 auto' }}>
        {index !== 0 && (
          <Divider spacingBottom={Spacing.S24} spacingTop={Spacing.S20} />
        )}

        <Controller
          control={control}
          name={`roles.${index}.role`}
          render={({ field: { onChange, value }, fieldState }) => (
            <Select
              autocomplete
              clearable
              error={Boolean(fieldState.error?.message)}
              errorMessage={fieldState.error?.message ?? ''}
              items={options}
              noItemsLabel="You have no options to choose from"
              onChange={(event) => {
                const newValue = event.detail as unknown as null | RolesType;
                onChange(newValue);
                setValue(`roles.${index}.entities`, null);
              }}
              placeholder="Select a Role"
              selected={value || null}
              valueFn={(item) => (item as RolesType).label}
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
        style={{
          flex: '0 1 auto',
          marginTop: index === 0 ? `-${Spacing.S2}` : Spacing.S40,
          paddingTop: index === 0 ? undefined : Spacing.S4,
          verticalAlign: 'top',
        }}
      >
        <Tooltip
          disabled={roles.length > 1}
          tooltipPlacement="bottom"
          tooltipText={
            roles.length === 1 ? 'At least one role is required.' : undefined
          }
        >
          <Button
            disabled={roles.length === 1}
            onClick={() => onRemove(index)}
            style={{ paddingLeft: Spacing.S12 }}
            variant="icon"
          >
            <Icon icon="delete" size="m" />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};
