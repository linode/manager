import { yupResolver } from '@hookform/resolvers/yup';
import {
  useAllFirewallsQuery,
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
  Select,
  Stack,
  Typography,
} from '@linode/ui';
import { UpdateFirewallSettingsSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

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

  const {
    data: firewalls,
    error: firewallsError,
    isLoading: isLoadingfirewalls,
  } = useAllFirewallsQuery();
  const firewallOptions =
    firewalls?.map((firewall) => {
      return { label: firewall.label, value: firewall.id };
    }) ?? [];

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

  if (isLoadingFirewallSettings || isLoadingfirewalls) {
    return (
      <Accordion defaultExpanded heading="Default Firewalls">
        <CircleProgress />
      </Accordion>
    );
  }

  if (firewallSettingsError || firewallsError) {
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
        <Stack>
          <Typography>
            Set the default firewall that is assigned to each network interface
            type when creating a Linode. The same firewall (new or existing) can
            be assigned to each type of interface/connection.
          </Typography>
          <Typography
            sx={(theme) => ({ marginTop: theme.spacing(2) })}
            variant="h3"
          >
            Linodes
          </Typography>
          <Controller
            render={({ field, fieldState }) => (
              <Select
                onChange={(_, item) => {
                  field.onChange(item?.value);
                }}
                value={
                  firewallOptions.find(
                    (option) => option.value === field.value
                  ) ?? null
                }
                errorText={fieldState.error?.message}
                label="Configuration Profile Interfaces Firewall"
                options={firewallOptions}
                placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
              />
            )}
            control={control}
            name="default_firewall_ids.linode"
          />
          <Controller
            render={({ field, fieldState }) => (
              <Select
                onChange={(_, item) => {
                  field.onChange(item?.value);
                }}
                value={
                  firewallOptions.find(
                    (option) => option.value === field.value
                  ) ?? null
                }
                errorText={fieldState.error?.message}
                label="Linode Interfaces - Public Interface Firewall"
                options={firewallOptions}
                placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
              />
            )}
            control={control}
            name="default_firewall_ids.public_interface"
          />
          <Controller
            render={({ field, fieldState }) => (
              <Select
                onChange={(_, item) => {
                  field.onChange(item?.value);
                }}
                value={
                  firewallOptions.find(
                    (option) => option.value === field.value
                  ) ?? null
                }
                errorText={fieldState.error?.message}
                label="Linode Interfaces - VPC Interface Firewall"
                options={firewallOptions}
                placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
              />
            )}
            control={control}
            name="default_firewall_ids.vpc_interface"
          />
          <Divider spacingBottom={16} spacingTop={16} />
          <Typography variant="h3">NodeBalancers</Typography>
          <Controller
            render={({ field, fieldState }) => (
              <Select
                onChange={(_, item) => {
                  field.onChange(item?.value);
                }}
                value={
                  firewallOptions.find(
                    (option) => option.value === field.value
                  ) ?? null
                }
                errorText={fieldState.error?.message}
                label="NodeBalancers Firewall"
                options={firewallOptions}
                placeholder={DEFAULT_FIREWALL_PLACEHOLDER}
              />
            )}
            control={control}
            name="default_firewall_ids.nodebalancer"
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
    </Accordion>
  );
};
