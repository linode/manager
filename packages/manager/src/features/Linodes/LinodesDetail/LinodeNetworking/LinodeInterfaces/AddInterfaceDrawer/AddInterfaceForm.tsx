import { yupResolver } from '@hookform/resolvers/yup';
import { Notice, omitProps } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useCreateLinodeInterfaceMutation } from 'src/queries/linodes/interfaces';

import { Actions } from './Actions';
import { InterfaceType } from './InterfaceType';
import { CreateLinodeInterfaceFormSchema } from './utilities';

import type { CreateInterfaceFormValues } from './utilities';

interface Props {
  linodeId: number;
  onClose: () => void;
}

export const AddInterfaceForm = (props: Props) => {
  const { linodeId, onClose } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync } = useCreateLinodeInterfaceMutation(linodeId);

  const form = useForm<CreateInterfaceFormValues>({
    defaultValues: { public: {} },
    resolver: yupResolver(CreateLinodeInterfaceFormSchema),
  });

  const onSubmit = async (values: CreateInterfaceFormValues) => {
    console.log("Values", values);
    try {
      await mutateAsync(omitProps(values, ['interfaceType']));

      enqueueSnackbar('Successfully added network interface.', {
        variant: 'success',
      });
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  console.error("Form Errors:", form.formState.errors);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {form.formState.errors.root && (
          <Notice text={form.formState.errors.root.message} variant="error" />
        )}
        <InterfaceType />
        <Actions onClose={onClose} />
      </form>
    </FormProvider>
  );
};
