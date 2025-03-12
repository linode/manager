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
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { UpdateFirewallSettings } from '@linode/api-v4';

export const DefaultFirewalls = () => {
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
            Choose the preferred firewall to be assigned for each type of
            interface/connection
          </Typography>
          <Typography
            sx={(theme) => ({ marginTop: theme.spacing(2) })}
            variant="h3"
          >
            Linodes - Configuration Profile Interfaces
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
                label="All"
                options={firewallOptions}
                placeholder="Select a firewall"
              />
            )}
            control={control}
            name="default_firewall_ids.linode"
          />
          <Divider spacingBottom={16} spacingTop={16} />
          <Typography variant="h3">Linodes - Linode Interfaces</Typography>
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
                label="Public Interface"
                options={firewallOptions}
                placeholder="Select a firewall"
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
                label="VPC Interface"
                options={firewallOptions}
                placeholder="Select a firewall"
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
                label="NodeBalancers"
                options={firewallOptions}
                placeholder="Select a firewall"
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
