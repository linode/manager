import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { Stack } from 'src/components/Stack';
import { useCreateLinodeMutation } from 'src/queries/linodes/linodes';

import { Error } from './Error';
import { Plan } from './Plan';
import { Region } from './Region';
import { Summary } from './Summary';

import type { CreateLinodeRequest } from '@linode/api-v4';
import type { SubmitHandler } from 'react-hook-form';

export const LinodeCreatev2 = () => {
  const methods = useForm<CreateLinodeRequest>();
  const history = useHistory();

  const { mutateAsync: createLinode } = useCreateLinodeMutation();

  const onSubmit: SubmitHandler<CreateLinodeRequest> = async (data) => {
    try {
      const linode = await createLinode(data);

      history.push(`/linodes/${linode.id}`);
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          methods.setError(error.field, { message: error.reason });
        } else {
          methods.setError('root', { message: error.reason });
        }
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <Error />
          <Region />
          <Plan />
          <Summary />
        </Stack>
      </form>
    </FormProvider>
  );
};
