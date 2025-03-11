import {
  useAllFirewallsQuery,
  useFirewallSettingsQuery,
  useMutateFirewallSettings,
} from '@linode/queries';
import {
  Accordion,
  Autocomplete,
  Box,
  Button,
  CircleProgress,
  Divider,
  ErrorState,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
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
  const firewallOptions = firewalls ?? [];
  const values = {
    default_firewall_ids: firewallSettings?.default_firewall_ids ?? {},
  };

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<UpdateFirewallSettings>({
    defaultValues: values,
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
              <Autocomplete
                onChange={(_, item) => {
                  field.onChange(item?.id);
                }}
                value={
                  firewallOptions.find((option) => option.id === field.value) ??
                  null
                }
                errorText={fieldState.error?.message}
                label="All"
                options={firewallOptions}
              />
            )}
            control={control}
            name="default_firewall_ids.linode"
          />
          <Divider spacingBottom={16} spacingTop={16} />
          <Typography variant="h3">Linodes - Linode Interfaces</Typography>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                onChange={(_, item) => {
                  field.onChange(item?.id);
                }}
                value={
                  firewallOptions.find((option) => option.id === field.value) ??
                  null
                }
                errorText={fieldState.error?.message}
                label="Public Interface"
                options={firewallOptions}
              />
            )}
            control={control}
            name="default_firewall_ids.public_interface"
          />
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                onChange={(_, item) => {
                  field.onChange(item?.id);
                }}
                value={
                  firewallOptions.find((option) => option.id === field.value) ??
                  null
                }
                errorText={fieldState.error?.message}
                label="VPC Interface"
                options={firewallOptions}
              />
            )}
            control={control}
            name="default_firewall_ids.vpc_interface"
          />
          <Divider spacingBottom={16} spacingTop={16} />
          <Typography variant="h3">NodeBalancers</Typography>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                onChange={(_, item) => {
                  field.onChange(item?.id);
                }}
                value={
                  firewallOptions.find((option) => option.id === field.value) ??
                  null
                }
                errorText={fieldState.error?.message}
                label="NodeBalancers"
                options={firewallOptions}
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
