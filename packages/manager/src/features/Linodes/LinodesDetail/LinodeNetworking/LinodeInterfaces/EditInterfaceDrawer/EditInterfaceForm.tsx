import { yupResolver } from '@hookform/resolvers/yup';
import { useLinodeInterfaceQuery } from '@linode/queries';
import { ModifyLinodeInterfaceSchema } from '@linode/validation';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  interfaceId: number;
  linodeId: number;
  onClose: () => void;
  regionId: string;
}

export const EditInterfaceForm = (props: Props) => {
  const { interfaceId, linodeId } = props;

  const { data: linodeInterface } = useLinodeInterfaceQuery(
    linodeId,
    interfaceId
  );

  const form = useForm<ModifyLinodeInterfacePayload>({
    defaultValues: linodeInterface,
    resolver: yupResolver(ModifyLinodeInterfaceSchema),
    values: linodeInterface,
  });

  const onSubmit = (values: ModifyLinodeInterfacePayload) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>Form</form>
    </FormProvider>
  );
};
