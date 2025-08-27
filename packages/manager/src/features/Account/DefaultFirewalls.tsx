import { yupResolver } from '@hookform/resolvers/yup';
import {
  useFirewallSettingsQuery,
  useMutateFirewallSettings,
} from '@linode/queries';
import {
  Box,
  Button,
  CircleProgress,
  Divider,
  ErrorState,
  Notice,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { UpdateFirewallSettingsSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { FirewallSelect } from '../Firewalls/components/FirewallSelect';
import { usePermissions } from '../IAM/hooks/usePermissions';

import type { UpdateFirewallSettings } from '@linode/api-v4';

const DEFAULT_FIREWALL_PLACEHOLDER = 'None';

export const DefaultFirewalls = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const {
    data: firewallSettings,
    error: firewallSettingsError,
    isLoading: isLoadingFirewallSettings,
  } = useFirewallSettingsQuery({ enabled: isLinodeInterfacesEnabled });

  const { mutateAsync: updateFirewallSettings } = useMutateFirewallSettings();
  const { data: permissions } = usePermissions({
    accessType: 'account',
    permissionsToCheck: ['update_account_settings'],
  });
  const values = {
    default_firewall_ids: { ...firewallSettings?.default_firewall_ids },
  };

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<UpdateFirewallSettings>({
    defaultValues: { ...values },
    mode: 'onBlur',
    resolver: yupResolver(UpdateFirewallSettingsSchema),
    values,
  });

  const onSubmit = async (values: UpdateFirewallSettings) => {
    try {
      await updateFirewallSettings(values);
      enqueueSnackbar('Default firewall settings updated.', {
        variant: 'success',
      });
    } catch (error) {
      setError(error.field ?? 'root', { message: error[0].reason });
    }
  };

  if (isLoadingFirewallSettings) {
    return (
      <Paper data-testid="default-firewalls">
        <Typography variant="h2">Default Firewalls</Typography>
        <CircleProgress />
      </Paper>
    );
  }

  if (firewallSettingsError) {
    return (
      <Paper data-testid="default-firewalls">
        <Typography variant="h2">Default Firewalls</Typography>
        <ErrorState errorText="Unable to load your firewall settings and firewalls." />
      </Paper>
    );
  }

  return (
    <Paper data-testid="default-firewalls">
      <Typography mb={1} variant="h2">
        Default Firewalls
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.message && (
          <Notice variant="error">{errors.root.message}</Notice>
        )}
        <Stack mb={2} spacing={2}>
          <Typography>
            Select the default firewall for each device and/or interface type.
          </Typography>
          <Typography>
            For Linodes using Linode Interfaces, firewalls are assigned to the
            individual interface. For Linodes using Configuration Profile
            Interfaces, the firewall is assigned to the Linode itself and
            applies to all non-VLAN interfaces.
          </Typography>
          <Typography>
            Firewall templates are available for both VPC and public Linode
            Interfaces, and include pre-configured protection rules.
          </Typography>
        </Stack>
        <Stack divider={<Divider />} spacing={2}>
          <Stack spacing={2}>
            <Typography variant="h3">Linodes</Typography>
            <Controller
              control={control}
              name="default_firewall_ids.linode"
              render={({ field, fieldState }) => (
                <FirewallSelect
                  disableClearable
                  disabled={!permissions.update_account_settings}
                  errorText={fieldState.error?.message}
                  hideDefaultChips
                  label="Configuration Profile Interfaces Firewall"
                  onChange={(e, firewall) => field.onChange(firewall.id)}
                  placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
                  value={field.value}
                />
              )}
            />
            <Controller
              control={control}
              name="default_firewall_ids.public_interface"
              render={({ field, fieldState }) => (
                <FirewallSelect
                  disableClearable
                  disabled={!permissions.update_account_settings}
                  errorText={fieldState.error?.message}
                  hideDefaultChips
                  label="Linode Interfaces - Public Interface Firewall"
                  onChange={(e, firewall) => field.onChange(firewall.id)}
                  placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
                  value={field.value}
                />
              )}
            />
            <Controller
              control={control}
              name="default_firewall_ids.vpc_interface"
              render={({ field, fieldState }) => (
                <FirewallSelect
                  disableClearable
                  disabled={!permissions.update_account_settings}
                  errorText={fieldState.error?.message}
                  hideDefaultChips
                  label="Linode Interfaces - VPC Interface Firewall"
                  onChange={(e, firewall) => field.onChange(firewall.id)}
                  placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
                  value={field.value}
                />
              )}
            />
          </Stack>
          <Stack spacing={2}>
            <Typography variant="h3">NodeBalancers</Typography>
            <Controller
              control={control}
              name="default_firewall_ids.nodebalancer"
              render={({ field, fieldState }) => (
                <FirewallSelect
                  disableClearable
                  disabled={!permissions.update_account_settings}
                  errorText={fieldState.error?.message}
                  hideDefaultChips
                  label="NodeBalancers Firewall"
                  onChange={(e, firewall) => field.onChange(firewall.id)}
                  placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
                  value={field.value}
                />
              )}
            />
          </Stack>
        </Stack>
        <Box sx={(theme) => ({ marginTop: theme.spacingFunction(16) })}>
          <Button
            buttonType="outlined"
            disabled={!isDirty || !permissions.update_account_settings}
            loading={isSubmitting}
            type="submit"
          >
            Save
          </Button>
        </Box>
      </form>
    </Paper>
  );
};
