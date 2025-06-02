import { Autocomplete, SelectedIcon, Stack, Typography } from '@linode/ui';
import React from 'react';

import type { MaintenancePolicyId } from '@linode/api-v4';
import type { SelectProps, SxProps, Theme } from '@linode/ui';

type MaintenancePolicyOption = {
  description: string;
  label: string;
  value: MaintenancePolicyId;
};

const maintenancePolicyOptions: MaintenancePolicyOption[] = [
  {
    label: 'Migrate',
    value: 1,
    description:
      'Migrates the Linode to a new host while it remains fully operational. Recommended for maximizing availability.',
  },
  {
    label: 'Power Off / Power On',
    value: 2,
    description:
      'Powers off the Linode at the start of the maintenance event and reboots it once the maintenance finishes. Recommended for maximizing performance.',
  },
];

interface MaintenancePolicySelectProps {
  errorText?: string;
  onChange: SelectProps<MaintenancePolicyOption>['onChange'];
  sx?: SxProps<Theme>;
  textFieldProps?: SelectProps<MaintenancePolicyOption>['textFieldProps'];
  value: MaintenancePolicyId;
}

export const MaintenancePolicySelect = (
  props: MaintenancePolicySelectProps
) => {
  const { errorText, onChange, sx, textFieldProps, value } = props;

  return (
    <Autocomplete
      errorText={errorText}
      label="MaintenancePolicy"
      onChange={onChange}
      options={maintenancePolicyOptions}
      renderOption={(props, option, state) => (
        <li {...props}>
          <Stack alignItems="center" direction="row" gap={1}>
            <Stack>
              <b>{option.label}</b>
              {option.description}
            </Stack>
            {state.selected && <SelectedIcon visible />}
          </Stack>
        </li>
      )}
      sx={sx}
      textFieldProps={{
        ...{ tooltipText: optionsTooltipText, tooltipWidth: 410 },
        ...textFieldProps,
      }}
      value={maintenancePolicyOptions.find((option) => option.value === value)}
    />
  );
};

const optionsTooltipText = (
  <Stack spacing={2}>
    <Typography>
      <strong>Migrate:</strong> Migrates the Linode to a new host while it is
      still running. During the migration, the instance remains fully
      operational, though there is a temporary performance impact. For most
      maintenance events and Linode types, no reboot is required after the
      migration completes. If a reboot is required, it is automatically
      performed.
    </Typography>
    <Typography>
      <strong>Power Off / Power On:</strong> Powers off the Linode at the start
      of the maintenance event and reboots it once the maintenance finishes.
      Depending on the maintenance event and Linode type, the Linode may or may
      not remain on the same host. Do not select this option for Linodes that
      are used for container orchestration solutions like Kubernetes.
    </Typography>
  </Stack>
);
