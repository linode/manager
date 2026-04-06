import { yupResolver } from '@hookform/resolvers/yup';
import {
  useCreateLinodeInterfaceMutation,
  useLinodeInterfacesQuery,
} from '@linode/queries';
import { Box, CircleProgress, Notice, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  getCleanedLinodeInterfaceValues,
  getLinodeInterfacePayload,
} from 'src/features/Linodes/LinodeCreate/Networking/utilities';

import { getLinodeInterfaceType } from '../utilities';
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

  const { data: interfacesData, isPending: isLoadingInterfaces } =
    useLinodeInterfacesQuery(linodeId);

  const existingInterfaces =
    interfacesData?.interfaces.map((networkInterface) =>
      getLinodeInterfaceType(networkInterface)
    ) ?? [];
  const form = useForm<CreateInterfaceFormValues>({
    defaultValues: {
      firewall_id: undefined,
      public: {},
      vlan: {},
      vpc: {
        ipv4: {
          addresses: [{ primary: true, address: 'auto' }],
        },
        ipv6: undefined,
      },
    },
    async resolver(rawValues, context, options) {
      const valuesWithOnlySelectedInterface = getCleanedLinodeInterfaceValues(
        structuredClone(rawValues)
      ) as CreateInterfaceFormValues;

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

  if (isLoadingInterfaces) {
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

  const additionalWarningMessage =
    'Each Linode comes with one public IP address. Additional public IP addresses are available upon request and will incur a monthly charge.';

  const getWarningNotice = () => {
    if (
      selectedInterfacePurpose === 'public' &&
      existingInterfaces.includes('VPC')
    ) {
      return (
        <Notice variant="warning">
          <Typography>
            This Linode already has a VPC interface. Having both a VPC interface
            and a public interface is not recommended. If you need internet
            access, consider using the VPC’s
            <strong> Public access</strong> option instead.
          </Typography>
          <Typography paddingTop={2}>{additionalWarningMessage}</Typography>
        </Notice>
      );
    }

    if (
      selectedInterfacePurpose === 'vpc' &&
      existingInterfaces.includes('Public')
    ) {
      return (
        <Notice variant="warning">
          <Typography>
            This Linode already has a public interface. Having both a VPC
            interface and a public interface is not recommended. If you need
            public internet access, consider using the VPC’s{' '}
            <strong> Public access</strong> option instead.
          </Typography>
          <Typography paddingTop={2}>{additionalWarningMessage}</Typography>
        </Notice>
      );
    }
    return null;
  };

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
          <InterfaceType existingInterfaces={existingInterfaces} />
          {getWarningNotice()}
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
