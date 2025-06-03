import { useAccountSettings, useMutateAccountSettings } from '@linode/queries';
import { Box, Button, Paper, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { MaintenancePolicySelect } from 'src/components/MaintenancePolicySelect/MaintenancePolicySelect';

import type { AccountSettings, MaintenancePolicyId } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

type MaintenancePolicyValues = Pick<AccountSettings, 'maintenance_policy_id'>;

export const MaintenancePolicy = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: accountSettings } = useAccountSettings();

  const { mutateAsync: updateAccountSettings } = useMutateAccountSettings();

  const values: MaintenancePolicyValues = {
    maintenance_policy_id: accountSettings?.maintenance_policy_id ?? 1,
  };

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<MaintenancePolicyValues>({
    defaultValues: values,
    values,
  });

  const onSubmit = async (values: MaintenancePolicyValues) => {
    try {
      await updateAccountSettings(values);
      enqueueSnackbar('Host Maintenance Policy settings updated.', {
        variant: 'success',
      });
    } catch (error) {
      setError('maintenance_policy_id', { message: error[0].reason });
    }
  };

  return (
    <Paper data-testid="host-maintenance-policy">
      <Typography variant="h2">Host Maintenance Policy</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mt={1}>
          <Typography variant="body1">
            Select the preferred default host maintenance policy for newly
            deployed Linodes. During host maintenance events (such as host
            upgrades), this policy setting determines the type of migration that
            is performed. This preference can be changed when creating new
            Linodes or modifying existing Linodes.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/host-maintenance-policy">
              Learn more
            </Link>
            .
          </Typography>
          <Controller
            control={control}
            name="maintenance_policy_id"
            render={({ field, fieldState }) => (
              <MaintenancePolicySelect
                errorText={fieldState.error?.message}
                hideDefaultOptionChip
                onChange={(_, item: SelectOption<MaintenancePolicyId>) => {
                  field.onChange(item?.value);
                }}
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
                }}
                value={field.value}
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
              Save Maintenance Policy
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};
