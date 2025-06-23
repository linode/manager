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
import { getPolicyLabel } from './utils';

import type { MaintenancePolicy } from '@linode/api-v4';
import type { TextFieldProps } from '@linode/ui';

interface Props {
  disabled?: boolean;
  errorText?: string;
  hideDefaultChip?: boolean;
  onChange: (policy: MaintenancePolicy) => void;
  textFieldProps?: Partial<TextFieldProps>;
  value?: null | number;
}

export const MaintenancePolicySelect = (props: Props) => {
  const {
    disabled,
    errorText,
    onChange,
    value,
    hideDefaultChip,
    textFieldProps,
  } = props;

  const { data: policies, isFetching } = useAccountMaintenancePoliciesQuery();
  const { data: accountSettings } = useAccountSettings();

  const options =
    policies?.map((policy) => ({
      ...policy,
      name: getPolicyLabel(policy),
      label: getPolicyLabel(policy),
    })) ?? [];

  const defaultPolicyId =
    accountSettings?.maintenance_policy_id ??
    policies?.find((p) => p.is_default)?.id;

  const selectedOption =
    (value
      ? options.find((o) => o.id === value)
      : options.find((o) => o.is_default)) ?? null;

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
                <Typography>{policy.name.replace('Default ', '')}</Typography>
                {!hideDefaultChip && defaultPolicyId === policy.id && (
                  <DefaultPolicyChip />
                )}
              </Stack>
              <Stack direction="row">
                <Typography
                  sx={(theme) => ({
                    font: theme.tokens.alias.Typography.Label.Regular.Xs,
                  })}
                >
                  {MAINTENANCE_POLICY_OPTION_DESCRIPTIONS[policy.id] ??
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
            selectedOption?.id === defaultPolicyId && (
              <InputAdornment position="end">
                <DefaultPolicyChip />
              </InputAdornment>
            ),
        },
        tooltipText: (
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
