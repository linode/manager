import { useAccountSettings, useMutateAccountSettings } from '@linode/queries';
import {
  BetaChip,
  Box,
  Button,
  Paper,
  Select,
  Stack,
  Typography,
} from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';

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
      label: 'Configuration Profile Interfaces but allow Linode Interfaces',
      value: 'legacy_config_default_but_linode_allowed',
    },
    {
      label: 'Linode Interfaces but allow Configuration Profile Interfaces',
      value: 'linode_default_but_legacy_config_allowed',
    },
    {
      label: 'Configuration Profile Interfaces Only',
      value: 'legacy_config_only',
    },
    {
      label: 'Linode Interfaces Only',
      value: 'linode_only',
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
    <Paper>
      <Typography variant="h2">Network Interface Type</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack marginTop={1}>
          <Typography variant="body1">
            Set the network interface for your Linode instances to use during
            creation. <Link to="/#">Learn more</Link>.
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
                  tooltipText:
                    '@TODO Linode Interfaces - get copy for this tooltip',
                }}
                value={accountSettingInterfaceOptions.find(
                  (option) => option.value === field.value
                )}
              />
            )}
          />
          <Box
            sx={(theme) => ({
              marginTop: theme.spacing(2),
            })}
          >
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
