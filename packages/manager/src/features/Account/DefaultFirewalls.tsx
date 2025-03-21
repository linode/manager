import { yupResolver } from '@hookform/resolvers/yup';
import {
  useFirewallSettingsQuery,
  useMutateFirewallSettings,
} from '@linode/queries';
import {
  Accordion,
  Box,
  Button,
  CircleProgress,
  Divider,
  ErrorState,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import { UpdateFirewallSettingsSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { FirewallSelect } from '../Firewalls/components/FirewallSelect';

import type { UpdateFirewallSettings } from '@linode/api-v4';

const DEFAULT_FIREWALL_PLACEHOLDER = 'None';

export const DefaultFirewalls = () => {
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: firewallSettings,
    error: firewallSettingsError,
    isLoading: isLoadingFirewallSettings,
  } = useFirewallSettingsQuery();

  const { mutateAsync: updateFirewallSettings } = useMutateFirewallSettings();

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
      <Accordion defaultExpanded heading="Default Firewalls">
        <CircleProgress />
      </Accordion>
    );
  }

  if (firewallSettingsError) {
    return (
      <Accordion defaultExpanded heading="Default Firewalls">
        <ErrorState errorText="Unable to load your firewall settings and firewalls." />
      </Accordion>
    );
  }

  return (
    <Accordion defaultExpanded heading="Default Firewalls">
      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.message && (
          <Notice variant="error">{errors.root.message}</Notice>
        )}
        <Typography sx={{ mb: 2 }}>
          Set the default firewall that is assigned to each network interface
          type when creating a Linode. The same firewall (new or existing) can
          be assigned to each type of interface/connection.
        </Typography>
        <Stack divider={<Divider />} spacing={3}>
          <Stack spacing={2}>
            <Typography variant="h3">Linodes</Typography>
            <Controller
              render={({ field, fieldState }) => (
                <FirewallSelect
                  onChange={(_, item) => {
                    field.onChange(item?.id);
                  }}
                  errorText={fieldState.error?.message}
                  hideDefaultChips
                  label="Configuration Profile Interfaces Firewall"
                  placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
                  value={field.value}
                />
              )}
              control={control}
              name="default_firewall_ids.linode"
            />
            <Controller
              render={({ field, fieldState }) => (
                <FirewallSelect
                  onChange={(_, item) => {
                    field.onChange(item?.id);
                  }}
                  errorText={fieldState.error?.message}
                  hideDefaultChips
                  label="Linode Interfaces - Public Interface Firewall"
                  placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
                  value={field.value}
                />
              )}
              control={control}
              name="default_firewall_ids.public_interface"
            />
            <Controller
              render={({ field, fieldState }) => (
                <FirewallSelect
                  onChange={(_, item) => {
                    field.onChange(item?.id);
                  }}
                  errorText={fieldState.error?.message}
                  hideDefaultChips
                  label="Linode Interfaces - VPC Interface Firewall"
                  placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
                  value={field.value}
                />
              )}
              control={control}
              name="default_firewall_ids.vpc_interface"
            />
          </Stack>
          <Stack spacing={2}>
            <Typography variant="h3">NodeBalancers</Typography>
            <Controller
              render={({ field, fieldState }) => (
                <FirewallSelect
                  onChange={(_, item) => {
                    field.onChange(item?.id);
                  }}
                  errorText={fieldState.error?.message}
                  hideDefaultChips
                  label="NodeBalancers Firewall"
                  placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
                  value={field.value}
                />
              )}
              control={control}
              name="default_firewall_ids.nodebalancer"
            />
          </Stack>
        </Stack>
        <Box sx={(theme) => ({ marginTop: theme.spacing(2) })}>
          <Button
            buttonType="outlined"
            disabled={!isDirty}
            loading={isSubmitting}
            type="submit"
          >
            Save
          </Button>
        </Box>
      </form>
    </Accordion>
  );
};
