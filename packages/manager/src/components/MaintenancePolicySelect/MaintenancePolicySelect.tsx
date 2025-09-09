import {
  useAccountMaintenancePoliciesQuery,
  useAccountSettings,
} from '@linode/queries';
import {
  Autocomplete,
  InputAdornment,
  SelectedIcon,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';

import {
  MAINTENANCE_POLICY_OPTION_DESCRIPTIONS,
  MIGRATE_TOOLTIP_TEXT,
  POWER_OFF_TOOLTIP_TEXT,
} from './constants';
import { DefaultPolicyChip } from './DefaultPolicyChip';

import type { MaintenancePolicy } from '@linode/api-v4';
import type { TextFieldProps } from '@linode/ui';

interface MaintenancePolicySelectProps {
  disabled?: boolean;
  disabledReason?: string;
  errorText?: string;
  hideDefaultChip?: boolean;
  onChange: (policy: MaintenancePolicy) => void;
  textFieldProps?: Partial<TextFieldProps>;
  value?: string;
}

export const MaintenancePolicySelect = (
  props: MaintenancePolicySelectProps
) => {
  const {
    disabled,
    disabledReason,
    errorText,
    onChange,
    value,
    hideDefaultChip,
    textFieldProps,
  } = props;

  const { data: policies, isFetching } = useAccountMaintenancePoliciesQuery();
  const { data: accountSettings } = useAccountSettings();

  const options = policies ?? [];

  const defaultPolicyId =
    accountSettings?.maintenance_policy ??
    policies?.find((p) => p.is_default)?.slug;

  // Return null (controlled) instead of undefined (uncontrolled) to keep Autocomplete controlled
  const selectedOption = value
    ? (options.find((o) => o.slug === value) ?? null)
    : (options.find((o) => o.is_default) ?? null);

  return (
    <Autocomplete
      disableClearable={!!selectedOption}
      disabled={disabled}
      errorText={errorText}
      label="Maintenance Policy"
      loading={isFetching}
      noMarginTop
      onChange={(e, policy) => {
        if (policy) {
          onChange(policy);
        }
      }}
      options={options}
      renderOption={(props, policy, state) => {
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
                <Typography>{policy.label}</Typography>
                {!hideDefaultChip && defaultPolicyId === policy.slug && (
                  <DefaultPolicyChip />
                )}
              </Stack>
              <Stack direction="row">
                <Typography
                  sx={(theme) => ({
                    font: theme.tokens.alias.Typography.Label.Regular.Xs,
                  })}
                >
                  {MAINTENANCE_POLICY_OPTION_DESCRIPTIONS[policy.slug] ??
                    policy.description}
                </Typography>
                {state.selected && <SelectedIcon visible />}
              </Stack>
            </Stack>
          </li>
        );
      }}
      textFieldProps={{
        InputProps: {
          endAdornment: !hideDefaultChip &&
            selectedOption?.slug === defaultPolicyId && (
              <InputAdornment position="end">
                <DefaultPolicyChip />
              </InputAdornment>
            ),
        },
        tooltipText:
          disabled && textFieldProps?.tooltipText ? (
            textFieldProps?.tooltipText
          ) : disabled && disabledReason ? (
            // Show tooltip for permission issues or other specific reasons
            disabledReason
          ) : disabled ? undefined : ( // Don't show tooltip when disabled
            // Show informational tooltip when not disabled
            <Stack spacing={2}>
              <Typography>
                <strong>Migrate:</strong> {MIGRATE_TOOLTIP_TEXT}
              </Typography>
              <Typography>
                <strong>Power Off / Power On:</strong> {POWER_OFF_TOOLTIP_TEXT}
              </Typography>
            </Stack>
          ),
        tooltipWidth: 410,
        ...textFieldProps,
      }}
      value={selectedOption}
    />
  );
};
