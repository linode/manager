import { useAccountSettings, useMutateAccountSettings } from '@linode/queries';
import {
  BetaChip,
  Box,
  Button,
  NewFeatureChip,
  Notice,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';
import {
  MAINTENANCE_POLICY_ACCOUNT_DESCRIPTION,
  UPCOMING_MAINTENANCE_NOTICE,
} from 'src/components/MaintenancePolicySelect/constants';
import { MaintenancePolicySelect } from 'src/components/MaintenancePolicySelect/MaintenancePolicySelect';
import { useFlags } from 'src/hooks/useFlags';
import { useUpcomingMaintenanceNotice } from 'src/hooks/useUpcomingMaintenanceNotice';

import { usePermissions } from '../IAM/hooks/usePermissions';

import type { MaintenancePolicyValues } from 'src/hooks/useUpcomingMaintenanceNotice.ts';

export const MaintenancePolicy = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: accountSettings } = useAccountSettings();

  const { mutateAsync: updateAccountSettings } = useMutateAccountSettings();

  const flags = useFlags();
  const { data: permissions } = usePermissions('account', [
    'update_account_settings',
  ]);
  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<MaintenancePolicyValues>({
    defaultValues: {
      maintenance_policy: 'linode/migrate', // Default to 'linode/migrate' if no policies are found
    },
    values: accountSettings
      ? {
          maintenance_policy: accountSettings.maintenance_policy,
        }
      : undefined,
  });

  const { showUpcomingMaintenanceNotice } = useUpcomingMaintenanceNotice({
    control,
    // For account-level settings, we don't have a specific entity ID
    // The hook will check for any upcoming maintenance events
  });

  const onSubmit = async (values: MaintenancePolicyValues) => {
    try {
      await updateAccountSettings(values);
      enqueueSnackbar('Host Maintenance Policy settings updated.', {
        variant: 'success',
      });
    } catch (error) {
      setError('maintenance_policy', { message: error[0].reason });
    }
  };

  return (
    <Paper data-testid="host-maintenance-policy">
      <Typography variant="h2">
        Host Maintenance Policy {getFeatureChip(flags.vmHostMaintenance || {})}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack mt={1} spacing={2}>
          <Typography variant="body1">
            {MAINTENANCE_POLICY_ACCOUNT_DESCRIPTION}{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/host-maintenance-policy">
              Learn more
            </Link>
            .
          </Typography>
          {showUpcomingMaintenanceNotice && (
            <Notice variant="warning">
              There are Linodes that have upcoming scheduled maintenance.{' '}
              {UPCOMING_MAINTENANCE_NOTICE}
            </Notice>
          )}
          <Controller
            control={control}
            name="maintenance_policy"
            render={({ field, fieldState }) => (
              <MaintenancePolicySelect
                disabled={!permissions.update_account_settings}
                errorText={fieldState.error?.message}
                hideDefaultChip
                onChange={(policy) => field.onChange(policy.slug)}
                value={field.value}
              />
            )}
          />
          <Box marginTop={2}>
            <Button
              buttonType="outlined"
              data-pendo-id="maintenance-policy-save-button"
              disabled={!isDirty || !permissions.update_account_settings}
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

export const getFeatureChip = (vmHostMaintenance: {
  beta?: boolean;
  new?: boolean;
}) => {
  if (vmHostMaintenance.beta) return <BetaChip />;
  if (vmHostMaintenance.new) return <NewFeatureChip />;
  return null;
};
