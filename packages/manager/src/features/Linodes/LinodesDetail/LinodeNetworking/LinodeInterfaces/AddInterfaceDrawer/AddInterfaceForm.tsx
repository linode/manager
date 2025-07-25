import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateLinodeInterfaceMutation } from '@linode/queries';
import { Notice, Stack } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  getCleanedLinodeInterfaceValues,
  getLinodeInterfacePayload,
} from 'src/features/Linodes/LinodeCreate/Networking/utilities';

import { Actions } from './Actions';
import { InterfaceFirewall } from './InterfaceFirewall';
import { InterfaceType } from './InterfaceType';
import { PublicInterface } from './Public/PublicInterface';
import { CreateLinodeInterfaceFormSchema } from './utilities';
import { VLANInterface } from './VLAN/VLANInterface';
import { VPCInterface } from './VPC/VPCInterface';

import type { CreateInterfaceFormValues } from './utilities';

interface Props {
  linodeId: number;
  onClose: () => void;
  regionId: string;
}

export const AddInterfaceForm = (props: Props) => {
  const { linodeId, onClose, regionId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync } = useCreateLinodeInterfaceMutation(linodeId);

  const form = useForm<CreateInterfaceFormValues>({
    defaultValues: {
      firewall_id: null,
      public: {},
      vlan: {},
      vpc: {
        ipv4: {
          addresses: [{ primary: true, address: 'auto' }],
        },
      },
    },
    async resolver(rawValues, context, options) {
      const valuesWithOnlySelectedInterface = getCleanedLinodeInterfaceValues(
        structuredClone(rawValues)
      );

      const { errors, values } = await yupResolver(
        CreateLinodeInterfaceFormSchema
      )(valuesWithOnlySelectedInterface, context, options);

      if (errors) {
        return { errors, values };
      }

      return { errors: {}, values };
    },
  });

  const onSubmit = async (values: CreateInterfaceFormValues) => {
    try {
      await mutateAsync(getLinodeInterfacePayload(values));

      enqueueSnackbar('Successfully added network interface.', {
        variant: 'success',
      });
      onClose();
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  const selectedInterfacePurpose = form.watch('purpose');

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Notice
            text="To add a network interface, the Linode must be shut down. Changes apply when it's powered on."
            variant="info"
          />
          {form.formState.errors.root && (
            <Notice
              spacingBottom={0}
              spacingTop={0}
              text={form.formState.errors.root.message}
              variant="error"
            />
          )}
          <InterfaceType />
          {selectedInterfacePurpose === 'public' && <PublicInterface />}
          {selectedInterfacePurpose === 'vlan' && (
            <VLANInterface regionId={regionId} />
          )}
          {selectedInterfacePurpose === 'vpc' && (
            <VPCInterface regionId={regionId} />
          )}
          {selectedInterfacePurpose !== 'vlan' && <InterfaceFirewall />}
          <Actions onClose={onClose} />
        </Stack>
      </form>
    </FormProvider>
  );
};
