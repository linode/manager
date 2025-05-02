import { yupResolver } from '@hookform/resolvers/yup';
import {
  useLinodeInterfaceSettingsMutation,
  useLinodeInterfaceSettingsQuery,
  useLinodeInterfacesQuery,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Box,
  CircleProgress,
  Divider,
  ErrorState,
  FormControlLabel,
  Notice,
  Stack,
  Toggle,
  Typography,
} from '@linode/ui';
import { UpdateLinodeInterfaceSettingsSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';

import { getLinodeInterfaceType } from './utilities';

import type {
  LinodeInterfaceSettings,
  LinodeInterfaceSettingsPayload,
} from '@linode/api-v4';

interface Props {
  linodeId: number;
  onClose: () => void;
}

export const InterfaceSettingsForm = (props: Props) => {
  const { onClose, linodeId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    data,
    isPending: isLoadingInterfaceSettings,
    error: interfaceSettingsError,
  } = useLinodeInterfaceSettingsQuery(linodeId);

  const {
    data: interfacesData,
    isPending: isLoadingInterfaces,
    error: interfacesError,
  } = useLinodeInterfacesQuery(linodeId);

  const interfaces = interfacesData?.interfaces.map((networkInterface) => ({
    ...networkInterface,
    label: `${getLinodeInterfaceType(networkInterface)} Interface (ID : ${networkInterface.id})`,
  }));

  const { mutateAsync: updateSettings } =
    useLinodeInterfaceSettingsMutation(linodeId);

  const form = useForm<LinodeInterfaceSettingsPayload>({
    defaultValues: data,
    values: data,
    resolver: yupResolver(UpdateLinodeInterfaceSettingsSchema),
  });

  const onSubmit = async (values: LinodeInterfaceSettings) => {
    try {
      await updateSettings(values);
      enqueueSnackbar('Successfully updated interface settings.', {
        variant: 'success',
      });
      onClose();
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  if (isLoadingInterfaces || isLoadingInterfaceSettings) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100% - 100px)',
        }}
      >
        <CircleProgress size="md" />
      </Box>
    );
  }

  const error = interfacesError ?? interfaceSettingsError;

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }
  const numberOfEligibleIPv4Interfaces =
    data?.default_route.ipv4_eligible_interface_ids.length ?? 0;
  const numberOfEligibleIPv6Interfaces =
    data?.default_route.ipv6_eligible_interface_ids.length ?? 0;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {form.formState.errors.root?.message && (
        <Notice text={form.formState.errors.root?.message} variant="error" />
      )}
      <Stack divider={<Divider />} spacing={2}>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="h3">Default Route Selection</Typography>
            {form.formState.errors.default_route?.message && (
              <Notice
                text={form.formState.errors.default_route?.message}
                variant="error"
              />
            )}
            <Typography>
              The network interface default route is the route a device uses
              when it doesn&rsquo;t have a specific route to a destination.
            </Typography>
            <Notice variant="info">
              <Typography
                sx={(theme) => ({
                  fontSize: theme.tokens.font.FontSize.Xs,
                  font: theme.font.bold,
                })}
              >
                The default route may change automatically when modifying
                interfaces.
              </Typography>
            </Notice>
          </Stack>
          <Controller
            control={form.control}
            name="default_route.ipv4_interface_id"
            render={({ field, fieldState }) => (
              <Autocomplete
                disableClearable={numberOfEligibleIPv4Interfaces > 0}
                errorText={fieldState.error?.message}
                label="Default IPv4 Route"
                noMarginTop
                onChange={(e, i) => field.onChange(i?.id ?? null)}
                options={interfaces ?? []}
                placeholder="None"
                value={interfaces?.find((i) => i.id === field.value) ?? null}
              />
            )}
          />
          <Controller
            control={form.control}
            name="default_route.ipv6_interface_id"
            render={({ field, fieldState }) => (
              <Autocomplete
                disableClearable={numberOfEligibleIPv6Interfaces > 0}
                errorText={fieldState.error?.message}
                label="Default IPv6 Route"
                noMarginTop
                onChange={(e, i) => field.onChange(i?.id ?? null)}
                options={interfaces ?? []}
                placeholder="None"
                value={interfaces?.find((i) => i.id === field.value) ?? null}
              />
            )}
          />
        </Stack>
        <Stack spacing={1}>
          <Typography variant="h3">Network Helper</Typography>
          {form.formState.errors.network_helper?.message && (
            <Notice
              text={form.formState.errors.network_helper.message}
              variant="error"
            />
          )}
          <Typography>
            Enable the <i>Network Helper</i> to automatically adjust your
            Linode&rsquo;s internal network configuration files during each
            system boot.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/automatically-configure-networking">
              Learn more
            </Link>
            .
          </Typography>
          <Controller
            control={form.control}
            name="network_helper"
            render={({ field }) => (
              <FormControlLabel
                checked={field.value ?? false}
                control={<Toggle />}
                label="Enable Network Helper"
                onChange={field.onChange}
                sx={{ ml: '-10px !important' }}
              />
            )}
          />
        </Stack>
      </Stack>
      <ActionsPanel
        primaryButtonProps={{
          label: 'Save',
          type: 'submit',
          loading: form.formState.isSubmitting,
          disabled: !form.formState.isDirty,
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: onClose,
        }}
      />
    </form>
  );
};
