import { yupResolver } from '@hookform/resolvers/yup';
import {
  useLinodeInterfaceQuery,
  useUpdateLinodeInterfaceMutation,
} from '@linode/queries';
import { ActionsPanel, Checkbox, Stack } from '@linode/ui';
import { ModifyLinodeInterfaceSchema } from '@linode/validation';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  interfaceId: number;
  linodeId: number;
  onClose: () => void;
  regionId: string;
}

export const EditInterfaceForm = (props: Props) => {
  const { interfaceId, linodeId, onClose } = props;

  const { data: linodeInterface } = useLinodeInterfaceQuery(
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
    alert(JSON.stringify(values, null, 2));
    try {
      await mutateAsync(values);
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', error.reason);
      }
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={1}>
          <Controller
            render={({ field, fieldState }) => (
              <Checkbox
                checked={field.value ?? false}
                onChange={field.onChange}
                text="Default route for IPv4"
              />
            )}
            control={form.control}
            name="default_route.ipv4"
          />
          <Controller
            render={({ field, fieldState }) => (
              <Checkbox
                checked={field.value ?? false}
                onChange={field.onChange}
                text="Default route for IPv6"
              />
            )}
            control={form.control}
            name="default_route.ipv6"
          />
          <ActionsPanel
            primaryButtonProps={{
              label: 'Save',
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
