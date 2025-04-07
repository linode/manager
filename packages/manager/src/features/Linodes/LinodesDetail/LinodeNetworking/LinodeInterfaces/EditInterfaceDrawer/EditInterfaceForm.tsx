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
import { DefaultRoute } from './PublicInterface/DefaultRoute';
import { IPv6Ranges } from './PublicInterface/IPv6Ranges';
import { PublicIPv4Addresses } from './PublicInterface/PublicIPv4Addresses';

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
      // onClose();
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
        <Stack divider={<Divider />} spacing={2}>
          <DefaultRoute linodeInterface={linodeInterface} />
          {interfaceType === 'Public' && (
            <Stack divider={<Divider />} spacing={2}>
              <PublicIPv4Addresses
                interfaceId={interfaceId}
                linodeId={linodeId}
              />
              <IPv6Ranges interfaceId={interfaceId} linodeId={linodeId} />
            </Stack>
          )}
          {interfaceType === 'VPC' && (
            <Notice
              text="TODO: Support editing a VPC interface"
              variant="warning"
            />
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
