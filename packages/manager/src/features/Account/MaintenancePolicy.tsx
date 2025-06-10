import { useAccountSettings, useMutateAccountSettings } from '@linode/queries';
import { BetaChip, Box, Button, Paper, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { MaintenancePolicySelect } from 'src/components/MaintenancePolicySelect/MaintenancePolicySelect';
import { useFlags } from 'src/hooks/useFlags';

import type { AccountSettings } from '@linode/api-v4';

type MaintenancePolicyValues = Pick<AccountSettings, 'maintenance_policy_id'>;

export const MaintenancePolicy = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: accountSettings } = useAccountSettings();

  const { mutateAsync: updateAccountSettings } = useMutateAccountSettings();

  const flags = useFlags();

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
      <Typography variant="h2">
        Host Maintenance Policy {flags.vmHostMaintenance?.beta && <BetaChip />}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mt={1} spacing={2}>
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
                onChange={(_, item) => {
                  field.onChange(item.value);
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
