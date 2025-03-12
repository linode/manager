import { Autocomplete, Button } from '@linode/ui';
import React from 'react';

import { AssignedPermissionsPanel } from 'src/features/IAM/Shared/AssignedPermissionsPanel/AssignedPermissionsPanel';
import { getRoleByName } from 'src/features/IAM/Shared/utilities';

import type { IamAccountPermissions } from '@linode/api-v4';
import type { RolesType } from 'src/features/IAM/Shared/utilities';
import Close from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import { Divider } from '@mui/material';

interface Props {
  options: RolesType[];
  index: number;
  selectedOption: RolesType | null;
  permissions: IamAccountPermissions;
  onChange: (idx: number, role: RolesType | null) => void;
  onRemove: (idx: number) => void;
}

export const AssignSingleRole = ({
  options,
  index,
  selectedOption,
  permissions,
  onChange,
  onRemove,
}: Props) => {
  // Get the selected role based on the `selectedOptions`
  const selectedRole = React.useMemo(() => {
    if (!selectedOption || !permissions) {
      return null;
    }
    return getRoleByName(permissions, selectedOption.value);
  }, [selectedOption, permissions]);

  return (
    <Box display={'flex'}>
      <Box
        display={'flex'}
        flexDirection={'column'}
        sx={(theme) => ({ flex: '5 1 auto' })}
      >
        {index !== 0 && (
          <Divider
            sx={(theme) => ({
              marginBottom: theme.spacing(1.5),
            })}
          ></Divider>
        )}
        <Autocomplete
          renderOption={(props, option) => (
            <li {...props} key={option.label}>
              {option.label}
            </li>
          )}
          label="Assign New Roles"
          options={options}
          value={selectedOption}
          onChange={(_, opt) => onChange(index, opt)}
          placeholder="Select a Role"
          textFieldProps={{ hideLabel: true }}
        />
        {selectedRole && (
          <AssignedPermissionsPanel
            key={selectedRole.name}
            role={selectedRole}
          />
        )}
      </Box>
      <Box
        sx={(theme) => ({
          flex: '0 1 auto',
          verticalAlign: 'top',
          marginTop: index === 0 ? theme.spacing(-0.5) : theme.spacing(2),
        })}
      >
        <Button disabled={index === 0} onClick={() => onRemove(index)}>
          <Close />
        </Button>
      </Box>
    </Box>
  );
};
