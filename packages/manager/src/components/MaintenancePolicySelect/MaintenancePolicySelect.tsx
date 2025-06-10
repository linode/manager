import { useAccountMaintenancePoliciesQuery } from '@linode/queries';
import { Autocomplete, Box, SelectedIcon, Stack, Typography } from '@linode/ui';
import React from 'react';

import { MIGRATE_TOOLTIP_TEXT, POWER_OFF_TOOLTIP_TEXT } from './constants';
import { DefaultPolicyChip } from './DefaultPolicyChip';

import type { MaintenancePolicyOption } from './constants';
import type { MaintenancePolicyId } from '@linode/api-v4';
import type { SelectProps, SxProps, Theme } from '@linode/ui';

interface MaintenancePolicySelectProps {
  defaultPolicyId?: MaintenancePolicyId;
  disabled?: boolean;
  errorText?: string;
  onChange: SelectProps<MaintenancePolicyOption>['onChange'];
  options?: MaintenancePolicyOption[];
  sx?: SxProps<Theme>;
  textFieldProps?: SelectProps<MaintenancePolicyOption>['textFieldProps'];
  value?: MaintenancePolicyId;
}

const optionsTooltipText = (
  <Stack spacing={2}>
    <Typography>
      <strong>Migrate:</strong> {MIGRATE_TOOLTIP_TEXT}
    </Typography>
    <Typography>
      <strong>Power Off / Power On:</strong> {POWER_OFF_TOOLTIP_TEXT}
    </Typography>
  </Stack>
);

export const MaintenancePolicySelect = (
  props: MaintenancePolicySelectProps
) => {
  const {
    defaultPolicyId,
    disabled,
    errorText,
    onChange,
    options,
    sx,
    textFieldProps,
    value,
  } = props;

  const { data: maintenancePolicies } =
    useAccountMaintenancePoliciesQuery(!options);

  const defaultPolicy = options
    ? { id: defaultPolicyId ?? 1 }
    : (maintenancePolicies?.find((p) => p.is_default) ?? { id: 1 });

  const availableOptions =
    options ||
    maintenancePolicies?.map((policy) => ({
      label: policy.name,
      value: policy.id,
      description: policy.description,
    })) ||
    [];

  const isLoading = !options && !maintenancePolicies;

  // Separate instance needed to maintain consistent controlled state.
  // As opposed to using same instance and switching between controlled and uncontrolled states.
  if (isLoading) {
    return (
      <Autocomplete
        disabled
        label="Maintenance Policy"
        loading
        noMarginTop
        options={[]}
        value={null}
      />
    );
  }

  const selectedValue = value ?? defaultPolicy.id;
  const selectedOption = availableOptions.find(
    (option) => option.value === selectedValue
  );

  return (
    <Autocomplete
      disableClearable
      disabled={disabled}
      errorText={errorText}
      label="Maintenance Policy"
      noMarginTop
      onChange={onChange}
      options={availableOptions}
      renderOption={(props, option, state) => {
        const { key } = props;
        return (
          <li {...props} key={key}>
            <Stack alignItems="center" direction="row" gap={1} width="100%">
              <Stack>
                <b>{option.label}</b>
                {option.description}
              </Stack>
              <Box flexGrow={1} />
              {defaultPolicy?.id === option.value && <DefaultPolicyChip />}
              {state.selected && <SelectedIcon visible />}
            </Stack>
          </li>
        );
      }}
      sx={sx}
      textFieldProps={{
        InputProps: {
          endAdornment: defaultPolicy?.id === selectedValue && (
            <DefaultPolicyChip />
          ),
        },
        tooltipText: optionsTooltipText,
        tooltipWidth: 410,
        ...textFieldProps,
      }}
      value={selectedOption}
    />
  );
};
