import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateLinodeInterfaceMutation } from '@linode/queries';
import { Button, Divider, Notice, Stack } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getLinodeInterfaceType } from '../utilities';
import { EditInterfaceFirewall } from './EditInterfaceFirewall';
import {
  EditLinodeInterfaceFormSchema,
  useUpdateLinodeInterfaceFirewallMutation,
} from './EditInterfaceForm.utils';
import { PublicIPv4Addresses } from './PublicInterface/IPv4Addresses';
import { IPv6Ranges } from './PublicInterface/IPv6Ranges';
import { VPCIPv4Addresses } from './VPCInterface/VPCIPv4Addresses';
import { VPCIPv4Ranges } from './VPCInterface/VPCIPv4Ranges';

import type { EditLinodeInterfaceFormValues } from './EditInterfaceForm.utils';
import type { Firewall, LinodeInterface } from '@linode/api-v4';

interface Props {
  linodeId: number;
  linodeInterface: LinodeInterface;
  linodeInterfaceFirewalls: Firewall[];
  onClose: () => void;
  regionId: string;
}

export const EditInterfaceForm = (props: Props) => {
  const { linodeInterface, linodeInterfaceFirewalls, linodeId, onClose } =
    props;

  const { enqueueSnackbar } = useSnackbar();

  const firewall = (linodeInterfaceFirewalls.find(
    (firewall) => firewall.status === 'enabled'
  ) ?? linodeInterfaceFirewalls[0]) as Firewall | undefined;

  const { mutateAsync: updateInterface, data: updatedInterface } =
    useUpdateLinodeInterfaceMutation(linodeId, linodeInterface.id);

  const {
    mutateAsync: updateInterfaceFirewall,
    data: firewallUpdateResult,
    reset,
  } = useUpdateLinodeInterfaceFirewallMutation(linodeId, linodeInterface.id);

  const defaultValues = {
    ...linodeInterface,
    firewall_id: firewall?.id ?? null,
  };

  const form = useForm<EditLinodeInterfaceFormValues>({
    defaultValues,
    resolver: yupResolver(EditLinodeInterfaceFormSchema, {
      stripUnknown: true,
    }),
    values: defaultValues,
    resetOptions: {
      keepErrors: true,
      keepDirty: true,
      keepDirtyValues: true,
    },
  });

  const { errors, isDirty, isSubmitting, dirtyFields } = form.formState;

  const onSubmit = async (values: EditLinodeInterfaceFormValues) => {
    const results = await Promise.allSettled([
      updateInterface(values),
      updateInterfaceFirewall({ firewall_id: values.firewall_id }),
    ]);

    // Handle Interface update errors
    if (results[0].status === 'rejected') {
      for (const error of results[0].reason) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }

    // Handle Firewall update errors
    if (results[1].status === 'rejected' && dirtyFields.firewall_id) {
      for (const error of results[1].reason) {
        form.setError('firewall_id', { message: error.reason });
      }
    }

    // Handle success
    if (results.every((r) => r.status === 'fulfilled')) {
      enqueueSnackbar('Interface successfully updated.', {
        variant: 'success',
      });
      onClose();
    }
  };

  const interfaceType = getLinodeInterfaceType(linodeInterface);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Notice
              text="Except for Firewall changes, updating the interface requires shutting down the Linode. Changes take effect when the Linode is powered on."
              variant="info"
            />
            {errors.root?.message && (
              <Notice text={errors.root?.message} variant="error" />
            )}
            {errors.default_route?.ipv4?.message && (
              <Notice
                text={errors.default_route?.ipv4?.message}
                variant="error"
              />
            )}
            {errors.default_route?.ipv6?.message && (
              <Notice
                text={errors.default_route?.ipv6?.message}
                variant="error"
              />
            )}
          </Stack>
          {!isSubmitting && updatedInterface !== undefined && (
            <Notice text="Interface successfully updated." variant="success" />
          )}
          <Stack divider={<Divider />} spacing={3}>
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
            <EditInterfaceFirewall
              showSuccessNotice={
                !isSubmitting &&
                firewallUpdateResult !== undefined &&
                firewallUpdateResult !== false
              }
            />
          </Stack>
          <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              disabled={!isDirty}
              onClick={() => {
                form.reset();
                reset();
              }}
            >
              Reset
            </Button>
            <Button
              buttonType="primary"
              disabled={!isDirty}
              loading={isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
};
