import { yupResolver } from '@hookform/resolvers/yup';
import {
  useLinodeInterfaceSettingsMutation,
  useLinodeInterfaceSettingsQuery,
  useLinodeInterfacesQuery,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Stack,
} from '@linode/ui';
import { UpdateLinodeInterfaceSettingsSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { getLinodeInterfaceType } from '../utilities';

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

  const { data: interfacesData } = useLinodeInterfacesQuery(linodeId);

  const interfaces = interfacesData?.interfaces.map((i) => ({
    ...i,
    label: `${getLinodeInterfaceType(i)} Interface (ID : ${i.id})`,
  }));

  const { data } = useLinodeInterfaceSettingsQuery(linodeId);

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
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Controller
          control={form.control}
          name="default_route.ipv4_interface_id"
          render={({ field, fieldState }) => (
            <Autocomplete
              disableClearable
              errorText={fieldState.error?.message}
              label="Default IPv4 Route"
              noMarginTop
              onChange={(e, i) => field.onChange(i.id)}
              options={interfaces ?? []}
              value={interfaces?.find((i) => i.id === field.value)}
            />
          )}
        />
        <Controller
          control={form.control}
          name="default_route.ipv6_interface_id"
          render={({ field, fieldState }) => (
            <Autocomplete
              disableClearable
              errorText={fieldState.error?.message}
              label="Default IPv6 Route"
              noMarginTop
              onChange={(e, i) => field.onChange(i.id)}
              options={interfaces ?? []}
              value={interfaces?.find((i) => i.id === field.value)}
            />
          )}
        />
        <Controller
          control={form.control}
          name="network_helper"
          render={({ field }) => (
            <FormControlLabel
              checked={field.value ?? false}
              control={<Checkbox />}
              label="Nework Helper"
              onChange={field.onChange}
              sx={{ ml: '-8px !important' }}
            />
          )}
        />
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
      </Stack>
    </form>
  );
};
