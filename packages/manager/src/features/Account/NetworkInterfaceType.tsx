import { useAccountSettings, useMutateAccountSettings } from '@linode/queries';
import {
  Box,
  Button,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';

import { usePermissions } from '../IAM/hooks/usePermissions';

import type {
  AccountSettings,
  LinodeInterfaceAccountSetting,
} from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

type InterfaceSettingValues = Pick<
  AccountSettings,
  'interfaces_for_new_linodes'
>;

interface AccountSettingInterfaceOptionType
  extends SelectOption<LinodeInterfaceAccountSetting> {
  tooltipText: string;
}

const accountSettingInterfaceOptions: AccountSettingInterfaceOptionType[] = [
  {
    label:
      'Linode Interfaces (default) but allow Configuration Profile Interfaces',
    value: 'linode_default_but_legacy_config_allowed',
    tooltipText:
      'Linode Interfaces are used by default unless you select Configuration Profile Interfaces. Linodes with Configuration Profile Interfaces can be upgraded to Linode Interfaces.',
  },
  {
    label: 'Linode Interfaces Only',
    value: 'linode_only',
    tooltipText:
      'Existing Linodes with Configuration Profile Interfaces will continue to work. You can upgrade these Linodes to use Linode Interfaces.',
  },
  {
    label:
      'Configuration Profile Interfaces (default) but allow Linode Interfaces',
    value: 'legacy_config_default_but_linode_allowed',
    tooltipText:
      'Configuration Profile Interfaces are used by default unless you select Linode Interfaces. You can upgrade to Linode Interfaces at any time.',
  },
  {
    label: 'Configuration Profile Interfaces Only',
    value: 'legacy_config_only',
    tooltipText:
      'Existing Linodes with Linode Interfaces will continue to work. Upgrades to Linode Interfaces are not available.',
  },
];

export const NetworkInterfaceType = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: accountSettings } = useAccountSettings();
  const theme = useTheme();

  const { mutateAsync: updateAccountSettings } = useMutateAccountSettings();
  const { data: permissions } = usePermissions('account', [
    'update_account_settings',
  ]);
  const values = {
    interfaces_for_new_linodes:
      accountSettings?.interfaces_for_new_linodes ??
      'linode_default_but_legacy_config_allowed',
  };

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<InterfaceSettingValues>({
    defaultValues: values,
    values,
  });

  const onSubmit = async (values: InterfaceSettingValues) => {
    try {
      await updateAccountSettings(values);
      enqueueSnackbar('Network Interface type settings updated.', {
        variant: 'success',
      });
    } catch (error) {
      setError('interfaces_for_new_linodes', { message: error[0].reason });
    }
  };

  return (
    <Paper data-testid="network-interface-type">
      <Typography id="interface-type" variant="h2">
        Network Interface Type
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mt={1}>
          <Typography>
            When creating new Linodes or upgrading existing ones, select between
            Configuration Profile Interfaces and Linode Interfaces.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/networking-interface">
              Learn more
            </Link>
            .
          </Typography>
          <Typography mt={2}>
            Linode Interfaces are recommended. However, use Configuration
            Profile Interfaces with LKE or when a Linode needs a private IP
            address.
          </Typography>
          <Controller
            control={control}
            name="interfaces_for_new_linodes"
            render={({ field, fieldState }) => (
              <Select
                disabled={!permissions.update_account_settings}
                errorText={fieldState.error?.message}
                label="Allowed interfaces for new Linodes"
                onChange={(
                  _,
                  item: SelectOption<LinodeInterfaceAccountSetting>
                ) => {
                  field.onChange(item?.value);
                }}
                options={accountSettingInterfaceOptions}
                sx={{
                  [theme.breakpoints.up('sm')]: {
                    '.MuiFormControl-root.MuiFormControl-fullWidth': {
                      minWidth: '480px',
                    },
                  },
                  '.MuiInputBase-root.MuiInput-root': {
                    maxWidth: '480px',
                  },
                }}
                textFieldProps={{
                  expand: true,
                  sx: {
                    width: '468px',
                  },
                  tooltipText: !permissions.update_account_settings
                    ? "You don't have permission to change this setting."
                    : optionsTooltipText,
                  tooltipWidth: 440,
                }}
                value={accountSettingInterfaceOptions.find(
                  (option) => option.value === field.value
                )}
              />
            )}
          />
          <Box marginTop={2}>
            <Button
              buttonType="outlined"
              disabled={!isDirty || !permissions.update_account_settings}
              loading={isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

const optionsTooltipText = (
  <Stack spacing={3}>
    {accountSettingInterfaceOptions.map((option) => (
      <Stack key={option.value}>
        <Typography>
          <strong>{option.label}</strong>
        </Typography>
        <Typography>{option.tooltipText}</Typography>
      </Stack>
    ))}
  </Stack>
);
