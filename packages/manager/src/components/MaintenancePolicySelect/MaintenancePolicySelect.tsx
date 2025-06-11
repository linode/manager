import { useAccountMaintenancePoliciesQuery } from '@linode/queries';
import {
  Autocomplete,
  InputAdornment,
  SelectedIcon,
  Stack,
  Typography,
} from '@linode/ui';
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

  const { data: maintenancePolicies, isFetching } =
    useAccountMaintenancePoliciesQuery(!options);

  const defaultPolicy = options
    ? { id: defaultPolicyId }
    : maintenancePolicies?.find((p) => p.is_default);

  const availableOptions =
    options ||
    maintenancePolicies?.map((policy) => ({
      label: policy.name,
      value: policy.id,
      description: policy.description,
    })) ||
    [];

  const noMaintenancePolicies = !options && maintenancePolicies === undefined;

  // If there's no maintenance policies, show empty list
  if (noMaintenancePolicies) {
    return (
      <Autocomplete
        disabled
        errorText={errorText}
        label="Maintenance Policy"
        noMarginTop
        options={[]}
        textFieldProps={{
          ...textFieldProps,
        }}
        value={null}
      />
    );
  }

  const selectedValue = value ?? defaultPolicy?.id;
  const selectedOption = availableOptions.find(
    (option) => option.value === selectedValue
  );

  return (
    <Autocomplete
      disableClearable
      disabled={disabled}
      errorText={errorText}
      label="Maintenance Policy"
      loading={isFetching}
      noMarginTop
      onChange={onChange}
      options={availableOptions}
      renderOption={(props, option, state) => {
        const { key } = props;
        return (
          <li {...props} key={key}>
            <Stack gap={0.5} width="100%">
              <Stack
                alignItems="center"
                direction="row"
                gap={1}
                justifyContent="space-between"
                width="100%"
              >
                <Typography>{option.label}</Typography>
                {defaultPolicy?.id === option.value && <DefaultPolicyChip />}
              </Stack>
              <Stack direction="row">
                <Typography
                  sx={(theme) => ({
                    font: theme.tokens.alias.Typography.Label.Regular.Xs,
                  })}
                >
                  {option.description}
                </Typography>
                {state.selected && <SelectedIcon visible />}
              </Stack>
            </Stack>
          </li>
        );
      }}
      sx={sx}
      textFieldProps={{
        InputProps: {
          endAdornment: defaultPolicy?.id === selectedValue && (
            <InputAdornment position="end">
              <DefaultPolicyChip />
            </InputAdornment>
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
