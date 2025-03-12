import { yupResolver } from '@hookform/resolvers/yup';
import {
  useAddFirewallDeviceMutation,
  useAllFirewallsQuery,
} from '@linode/queries';
import { ActionsPanel, Autocomplete, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { number, object } from 'yup';

import { Link } from 'src/components/Link';
import { formattedTypes } from 'src/features/Firewalls/FirewallDetail/Devices/constants';

import type { FirewallDeviceEntityType } from '@linode/api-v4';
import type { Resolver } from 'react-hook-form';

interface Values {
  firewallId: number;
}

const schema = object({
  firewallId: number().required('Firewall is required.'),
});

interface Props {
  entityId: number;
  entityType: FirewallDeviceEntityType;
  onCancel: () => void;
}

export const AddFirewallForm = (props: Props) => {
  const { entityId, entityType, onCancel } = props;
  const { enqueueSnackbar } = useSnackbar();

  const entityLabel = formattedTypes[entityType] ?? entityType;

  const {
    data: firewalls,
    error: firewallsError,
    isLoading: firewallsLoading,
  } = useAllFirewallsQuery();

  const { mutateAsync } = useAddFirewallDeviceMutation();

  const form = useForm<Values>({
    resolver: yupResolver(schema) as Resolver<Values>,
  });

  const onSubmit = async (values: Values) => {
    try {
      await mutateAsync({ ...values, id: entityId, type: entityType });

      enqueueSnackbar('Successfully assigned Firewall', { variant: 'success' });

      onCancel();
    } catch (errors) {
      form.setError('firewallId', { message: errors[0].reason });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography>
          Select a Firewall to assign to your {entityLabel}. If you need to
          create one, go to <Link to="/firewalls/create">Firewalls</Link>.
        </Typography>
        <Controller
          render={({ field, fieldState }) => (
            <Autocomplete
              errorText={
                fieldState.error?.message ?? firewallsError?.[0].reason
              }
              textFieldProps={{
                inputRef: field.ref,
              }}
              label="Firewall"
              loading={firewallsLoading}
              noMarginTop
              onChange={(e, value) => field.onChange(value?.id)}
              options={firewalls ?? []}
              placeholder="Select a Firewall"
              value={firewalls?.find((f) => f.id === field.value) ?? null}
            />
          )}
          control={form.control}
          name="firewallId"
        />
        <ActionsPanel
          primaryButtonProps={{
            label: 'Add Firewall',
            loading: form.formState.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onCancel,
          }}
        />
      </Stack>
    </form>
  );
};
