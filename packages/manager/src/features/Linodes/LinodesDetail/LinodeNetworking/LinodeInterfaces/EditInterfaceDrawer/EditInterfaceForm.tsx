import { yupResolver } from '@hookform/resolvers/yup';
import {
  firewallQueries,
  useAddFirewallDeviceMutation,
  useLinodeInterfaceFirewallsQuery,
  useLinodeInterfaceQuery,
  useRemoveFirewallDeviceMutation,
  useUpdateLinodeInterfaceMutation,
} from '@linode/queries';
import {
  Box,
  Button,
  CircleProgress,
  Divider,
  ErrorState,
  Notice,
  Stack,
} from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';

import { getLinodeInterfaceType } from '../utilities';
import { EditLinodeInterfaceFormSchema } from './EditInterfaceForm.utils';
import { PublicIPv4Addresses } from './PublicInterface/IPv4Addresses';
import { IPv6Ranges } from './PublicInterface/IPv6Ranges';
import { VPCIPv4Addresses } from './VPCInterface/VPCIPv4Addresses';
import { VPCIPv4Ranges } from './VPCInterface/VPCIPv4Ranges';

import type { InferType } from 'yup';

interface Props {
  interfaceId: number;
  linodeId: number;
  onClose: () => void;
  regionId: string;
}

export const EditInterfaceForm = (props: Props) => {
  const { interfaceId, linodeId, onClose } = props;

  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const {
    data: linodeInterface,
    error,
    isPending,
  } = useLinodeInterfaceQuery(linodeId, interfaceId);

  const { data: firewalls } = useLinodeInterfaceFirewallsQuery(
    linodeId,
    interfaceId
  );

  const firewall = firewalls?.data[0] ?? null;

  const { mutateAsync: createFirewallDevice } = useAddFirewallDeviceMutation();
  const { mutateAsync: deleteFirewallDevice } =
    useRemoveFirewallDeviceMutation();
  const { mutateAsync: updateInterface } = useUpdateLinodeInterfaceMutation(
    linodeId,
    interfaceId
  );

  const values = {
    ...linodeInterface,
    firewall_id: firewall?.id ?? null,
  };

  const form = useForm<InferType<typeof EditLinodeInterfaceFormSchema>>({
    defaultValues: values,
    resolver: yupResolver(EditLinodeInterfaceFormSchema),
    values,
  });

  const onSubmit = async (
    values: InferType<typeof EditLinodeInterfaceFormSchema>
  ) => {
    // User is changing the firewall
    if (values.firewall_id && firewall && values.firewall_id !== firewall.id) {
      // Get the firewall device to delete
      const devices = await queryClient.ensureQueryData(
        firewallQueries.firewall(firewall.id)._ctx.devices
      );
      const device = devices.find(
        (d) => d.entity.id === interfaceId && d.entity.type === 'interface'
      );
      if (device) {
        await deleteFirewallDevice({
          firewallId: firewall.id,
          deviceId: device.id,
        });
        await createFirewallDevice({
          firewallId: values.firewall_id,
          id: interfaceId,
          type: 'interface',
        });
      } else {
        // @todo handle error
      }
    } else if (!firewall && values.firewall_id) {
      await createFirewallDevice({
        firewallId: values.firewall_id,
        id: interfaceId,
        type: 'interface',
      });
    } else if (firewall && !values.firewall_id) {
      const devices = await queryClient.ensureQueryData(
        firewallQueries.firewall(firewall.id)._ctx.devices
      );
      const device = devices.find(
        (d) => d.entity.id === interfaceId && d.entity.type === 'interface'
      );
      if (device) {
        await deleteFirewallDevice({
          firewallId: firewall.id,
          deviceId: device.id,
        });
      }
    }

    try {
      await updateInterface(values);
      enqueueSnackbar('Interface successfully updated.', {
        variant: 'success',
      });
      onClose();
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (isPending) {
    return (
      <Box
        alignItems="center"
        display="flex"
        height="calc(100vh - 150px)"
        justifyContent="center"
      >
        <CircleProgress size="md" />
      </Box>
    );
  }

  const interfaceType = getLinodeInterfaceType(linodeInterface);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Notice
          spacingBottom={16}
          text="Updating the interface requires the Linode to be shut down. Changes will take effect when the Linode is powered on. "
          variant="warning"
        />
        {form.formState.errors.root?.message && (
          <Notice text={form.formState.errors.root?.message} variant="error" />
        )}
        <Stack divider={<Divider />} spacing={2}>
          {interfaceType === 'Public' && (
            <Stack divider={<Divider />} spacing={3}>
              <PublicIPv4Addresses linodeId={linodeId} />
              <IPv6Ranges linodeId={linodeId} />
            </Stack>
          )}
          {interfaceType === 'VPC' && (
            <Stack divider={<Divider />} spacing={3}>
              <VPCIPv4Addresses linodeInterface={linodeInterface} />
              <VPCIPv4Ranges />
            </Stack>
          )}
          {interfaceType === 'VLAN' && (
            <Notice
              text="TODO: Support editing a VLAN interface"
              variant="warning"
            />
          )}
          <Controller
            control={form.control}
            name="firewall_id"
            render={({ field, fieldState }) => (
              <FirewallSelect
                errorText={fieldState.error?.message}
                onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
                value={field.value}
              />
            )}
          />
        </Stack>
        <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            disabled={!form.formState.isDirty}
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button
            buttonType="primary"
            disabled={!form.formState.isDirty}
            loading={form.formState.isSubmitting}
            type="submit"
          >
            Save
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
};
