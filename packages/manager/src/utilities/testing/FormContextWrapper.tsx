import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { FieldValues, UseFormProps } from 'react-hook-form';

interface UseFormPropsWithChildren<T extends FieldValues>
  extends UseFormProps<T> {
  children: React.ReactNode;
}

export const FormContextWrapper = <T extends FieldValues>(
  props: UseFormPropsWithChildren<T>
) => {
  const formMethods = useForm<T>(props);

  return <FormProvider {...formMethods}>{props.children}</FormProvider>;
};
