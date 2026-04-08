import { Button, Icon } from '@akamai/cds-components/react';
import { Autocomplete } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { AssignedPermissionsPanel } from 'src/features/IAM/Shared/AssignedPermissionsPanel/AssignedPermissionsPanel';
import { getRoleByName } from 'src/features/IAM/Shared/utilities';

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
  const theme = useTheme();

  const { control, watch, setValue } =
    useFormContext<AssignNewRoleFormValues>();
  const role = watch(`roles.${index}.role`);
  const roles = watch('roles');

  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', flex: '5 1 auto' }}
      >
        {index !== 0 && (
          <Divider
            spacingBottom={theme.tokens.spacing.S24}
            spacingTop={theme.tokens.spacing.S20}
          />
        )}

        <Controller
          control={control}
          name={`roles.${index}.role`}
          render={({ field: { onChange, value }, fieldState }) => (
            <Autocomplete
              disablePortal={false} // Keep the Autocomplete's popover within the drawer
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

            // TODO: UIE-10739 - Replace with CDS Select
            // <Select
            //   autocomplete
            //   clearable
            //   error={Boolean(fieldState.error?.message)}
            //   errorMessage={fieldState.error?.message ?? ''}
            //   items={options}
            //   onChange={(event) => {
            //     const newValue = event.detail as unknown as null | RolesType;
            //     onChange(newValue);
            //     setValue(`roles.${index}.entities`, null);
            //   }}
            //   placeholder="Select a Role"
            //   selected={value || null}
            //   valueFn={(item) => (item as RolesType).label}
            // />
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
      </div>
      <div
        style={{
          flex: '0 1 auto',
          marginTop:
            index === 0
              ? `-${theme.tokens.spacing.S2}`
              : theme.tokens.spacing.S40,
          paddingTop: index === 0 ? undefined : theme.tokens.spacing.S4,
          verticalAlign: 'top',
        }}
      >
        <Button
          disabled={roles.length === 1}
          onClick={(event) => {
            event.preventDefault();
            onRemove(index);
          }}
          style={{ paddingRight: 0, paddingLeft: theme.tokens.spacing.S12 }}
          variant="icon"
        >
          <Icon icon="delete" size="m" />
        </Button>
      </div>
    </div>
  );
};
