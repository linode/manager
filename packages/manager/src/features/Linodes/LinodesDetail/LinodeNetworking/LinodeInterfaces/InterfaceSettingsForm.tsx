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
  ListItemOption,
  Stack,
  Toggle,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { UpdateLinodeInterfaceSettingsSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Link } from 'src/components/Link';

import { getDisabledInterfaceSelectOptions } from './InterfaceSettingsDrawer/InterfaceSettingsForm.utilities';
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

  const interfaces = interfacesData?.interfaces.map((i) => ({
    ...i,
    label: `${getLinodeInterfaceType(i)} Interface (ID : ${i.id})`,
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

  const disabledIPv4Interfaces =
    data &&
    interfacesData &&
    getDisabledInterfaceSelectOptions(interfacesData, data, 'IPv4');

  const disabledIPv6Interfaces =
    data &&
    interfacesData &&
    getDisabledInterfaceSelectOptions(interfacesData, data, 'IPv6');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack spacing={2} divider={<Divider />}>
        <Stack spacing={1.5}>
          <Typography variant="h3">Default Route</Typography>
          <Typography>
            The network interface default route is the route your Linode uses
            when traffic doesn&rsquo;t have a specific route to a destination.
            Note that the default route may change automatically when
            adding/removing IP Addresses on interfaces.
          </Typography>
          <Controller
            control={form.control}
            name="default_route.ipv4_interface_id"
            render={({ field, fieldState }) => (
              <Autocomplete
                disableClearable={Boolean(field.value)}
                errorText={fieldState.error?.message}
                getOptionDisabled={(option) =>
                  Boolean(disabledIPv4Interfaces?.[option.id])
                }
                label="Default IPv4 Route"
                noMarginTop
                onChange={(e, i) => field.onChange(i?.id ?? null)}
                options={interfaces ?? []}
                placeholder="Select an Interface"
                renderOption={({ key, ...props }, item, state) => (
                  <ListItemOption
                    disabledOptions={disabledIPv4Interfaces?.[item.id]}
                    item={item}
                    key={key}
                    props={props}
                    selected={state.selected}
                  >
                    {item.label}
                  </ListItemOption>
                )}
                value={interfaces?.find((i) => i.id === field.value) ?? null}
              />
            )}
          />
          <Controller
            control={form.control}
            name="default_route.ipv6_interface_id"
            render={({ field, fieldState }) => (
              <Autocomplete
                disableClearable={Boolean(field.value)}
                errorText={fieldState.error?.message}
                getOptionDisabled={(option) =>
                  Boolean(disabledIPv6Interfaces?.[option.id])
                }
                label="Default IPv6 Route"
                noMarginTop
                onChange={(e, i) => field.onChange(i?.id ?? null)}
                options={interfaces ?? []}
                placeholder="Select an Interface"
                renderOption={({ key, ...props }, item, state) => (
                  <ListItemOption
                    disabledOptions={disabledIPv6Interfaces?.[item.id]}
                    item={item}
                    key={key}
                    props={props}
                    selected={state.selected}
                  >
                    {item.label}
                  </ListItemOption>
                )}
                value={interfaces?.find((i) => i.id === field.value) ?? null}
              />
            )}
          />
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="h3">Networking Settings</Typography>
          <Controller
            control={form.control}
            name="network_helper"
            render={({ field }) => (
              <FormControlLabel
                checked={field.value ?? false}
                control={<Toggle />}
                label={
                  <Stack alignItems="center" direction="row" gap={0.5}>
                    <Typography>Automatically configure networking</Typography>
                    <TooltipIcon
                      status="help"
                      text={
                        <>
                          Enable the <i>Network Helper</i> to automatically
                          adjust your Linode&rsquo;s internal network
                          configuration files during each system boot.{' '}
                          <Link to="https://techdocs.akamai.com/cloud-computing/docs/automatically-configure-networking">
                            Learn more.
                          </Link>
                        </>
                      }
                    />
                  </Stack>
                }
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
