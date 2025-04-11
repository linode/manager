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
  DisableItemOption,
  FormControlLabel,
  ListItemOption,
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

  const disabledIPv4Interfaces = interfaces?.reduce<
    Record<number, DisableItemOption>
  >((acc, i) => {
    if (!data?.default_route.ipv4_eligible_interface_ids.includes(i.id)) {
      acc[i.id] = {
        reason: 'This interface is not eligible to be the default IPv4 route.',
      };
    }
    return acc;
  }, []);

  const disabledIPv6Interfaces = interfaces?.reduce<
    Record<number, DisableItemOption>
  >((acc, i) => {
    if (!data?.default_route.ipv6_eligible_interface_ids.includes(i.id)) {
      acc[i.id] = {
        reason: 'This interface is not eligible to be the default IPv6 route.',
      };
    }
    return acc;
  }, []);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack spacing={2}>
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
