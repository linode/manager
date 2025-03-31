import { yupResolver } from '@hookform/resolvers/yup';
import {
  useLinodeInterfaceQuery,
  useUpdateLinodeInterfaceMutation,
} from '@linode/queries';
import {
  ActionsPanel,
  Box,
  CircleProgress,
  ErrorState,
  Stack,
} from '@linode/ui';
import { ModifyLinodeInterfaceSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getLinodeInterfaceType } from '../utilities';
import { PublicIPv4Addresses } from './PublicInterface/PublicIPv4Addresses';
import { PublicIPv6Ranges } from './PublicInterface/PublicIPv6Ranges';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  interfaceId: number;
  linodeId: number;
  onClose: () => void;
  regionId: string;
}

export const EditInterfaceForm = (props: Props) => {
  const { interfaceId, linodeId, onClose } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linodeInterface, error, isPending } = useLinodeInterfaceQuery(
    linodeId,
    interfaceId
  );

  const { mutateAsync } = useUpdateLinodeInterfaceMutation(
    linodeId,
    interfaceId
  );

  const form = useForm<ModifyLinodeInterfacePayload>({
    defaultValues: linodeInterface,
    resolver: yupResolver(ModifyLinodeInterfaceSchema),
    values: linodeInterface,
  });

  const onSubmit = async (values: ModifyLinodeInterfacePayload) => {
    try {
      await mutateAsync(values);
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
        <Stack spacing={2}>
          {interfaceType === 'Public' && (
            <>
              <PublicIPv4Addresses
                interfaceId={interfaceId}
                linodeId={linodeId}
              />
              <PublicIPv6Ranges interfaceId={interfaceId} linodeId={linodeId} />
            </>
          )}
          {interfaceType === 'VPC' && 'Todo VPC'}
          {interfaceType === 'VLAN' && 'Todo VLAN'}
          <ActionsPanel
            primaryButtonProps={{
              disabled: !form.formState.isDirty,
              label: 'Save',
              loading: form.formState.isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        </Stack>
      </form>
    </FormProvider>
  );
};
