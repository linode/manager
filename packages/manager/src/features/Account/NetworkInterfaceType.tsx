import { useAccountSettings, useMutateAccountSettings } from '@linode/queries';
import { Box, Button, Paper, Select, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import type {
  AccountSettings,
  LinodeInterfaceAccountSetting,
} from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

type InterfaceSettingValues = Pick<
  AccountSettings,
  'interfaces_for_new_linodes'
>;

const accountSettingInterfaceOptions: SelectOption<LinodeInterfaceAccountSetting>[] =
  [
    {
      label: 'Linode Interfaces but allow Configuration Profile Interfaces',
      value: 'linode_default_but_legacy_config_allowed',
    },
    {
      label: 'Linode Interfaces Only',
      value: 'linode_only',
    },
    {
      label: 'Configuration Profile Interfaces but allow Linode Interfaces',
      value: 'legacy_config_default_but_linode_allowed',
    },
    {
      label: 'Configuration Profile Interfaces Only',
      value: 'legacy_config_only',
    },
  ];

export const NetworkInterfaceType = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: accountSettings } = useAccountSettings();

  const { mutateAsync: updateAccountSettings } = useMutateAccountSettings();

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
      <Typography variant="h2">Network Interface Type</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mt={1}>
          <Typography variant="body1">
            Choose whether to use Configuration Profile Interfaces or Linode
            Interfaces (BETA) when creating new Linodes or upgrading existing
            ones.
          </Typography>
          <Controller
            control={control}
            name="interfaces_for_new_linodes"
            render={({ field, fieldState }) => (
              <Select
                errorText={fieldState.error?.message}
                label="Interfaces for new Linodes"
                onChange={(
                  _,
                  item: SelectOption<LinodeInterfaceAccountSetting>
                ) => {
                  field.onChange(item?.value);
                }}
                options={accountSettingInterfaceOptions}
                sx={(theme) => ({
                  [theme.breakpoints.up('md')]: {
                    minWidth: '480px',
                  },
                })}
                textFieldProps={{
                  expand: true,
                  sx: {
                    width: '468px',
                  },
                  tooltipText: optionsTooltipText,
                  tooltipWidth: 410,
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
              disabled={!isDirty}
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
  <Stack spacing={2}>
    <Stack>
      <Typography>
        <strong>
          Linode Interfaces but allow Configuration Profile Interfaces
        </strong>
      </Typography>
      <Typography>
        Use Linode Interfaces by default, unless Configuration Profile
        Interfaces are explicitly selected. Linodes using Configuration Profile
        Interfaces can be upgraded to use Linode Interfaces.
      </Typography>
    </Stack>
    <Stack>
      <Typography>
        <strong>Linode Interfaces only</strong>
      </Typography>
      <Typography>
        Previously created Linodes using Configuration Profile Interfaces will
        continue to function. Linodes using Configuration Profile Interfaces can
        be upgraded to use Linode Interfaces.
      </Typography>
    </Stack>
    <Stack>
      <Typography>
        <strong>
          Configuration Profile Interfaces but allow Linode Interfaces
        </strong>
      </Typography>
      <Typography>
        Use Configuration Profile Interfaces by default, unless Linode
        Interfaces are explicitly selected, and can be upgraded to use Linode
        Interfaces.
      </Typography>
    </Stack>
    <Stack>
      <Typography>
        <strong>Configuration Profile Interfaces only</strong>
      </Typography>
      <Typography>
        Previously created Linodes using Linode Interfaces will continue to
        function. Linodes cannot be upgraded to use Linode Interfaces.
      </Typography>
    </Stack>
  </Stack>
);
