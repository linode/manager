import { yupResolver } from '@hookform/resolvers/yup';
import {
  useLinodeInterfaceQuery,
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
import { ModifyLinodeInterfaceSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getLinodeInterfaceType } from '../utilities';
import { PublicIPv4Addresses } from './PublicInterface/IPv4Addresses';
import { IPv6Ranges } from './PublicInterface/IPv6Ranges';
import { VPCIPv4Addresses } from './VPCInterface/VPCIPv4Addresses';
import { VPCIPv4Ranges } from './VPCInterface/VPCIPv4Ranges';

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

  const {
    data: linodeInterface,
    error,
    isPending,
  } = useLinodeInterfaceQuery(linodeId, interfaceId);

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
        <Notice
          spacingBottom={16}
          text="Updating the interface requires the Linode to be shut down. Changes will take affect when the Linode is powered on. "
          variant="warning"
        />
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
