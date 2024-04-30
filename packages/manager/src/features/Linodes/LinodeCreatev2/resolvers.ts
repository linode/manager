import { yupResolver } from '@hookform/resolvers/yup';
import { CreateLinodeSchema } from '@linode/validation';

import {
  CreateLinodeByCloningSchema,
  CreateLinodeFromBackupSchema,
} from './schemas';
import { getLinodeCreatePayload } from './utilities';
import { LinodeCreateFormValues } from './utilities';

import type { LinodeCreateType } from '../LinodesCreate/types';
import type { Resolver } from 'react-hook-form';

/**
 * Provides dynamic validation to the Linode Create form.
 *
 * Unfortunately, we have to wrap `yupResolver` so that we can transform the payload
 * using `getLinodeCreatePayload` before validation happens.
 */
export const resolver: Resolver<LinodeCreateFormValues> = async (
  values,
  context,
  options
) => {
  const transformedValues = getLinodeCreatePayload(values);

  const { errors } = await yupResolver(
    CreateLinodeSchema,
    {},
    { mode: 'async', rawValues: true }
  )(transformedValues, context, options);

  if (errors) {
    return { errors, values };
  }

  return { errors: {}, values };
};

export const cloneResolver: Resolver<LinodeCreateFormValues> = async (
  values,
  context,
  options
) => {
  const transformedValues = getLinodeCreatePayload(values);

  const { errors } = await yupResolver(
    CreateLinodeByCloningSchema,
    {},
    { mode: 'async', rawValues: true }
  )(
    {
      linode: values.linode ?? undefined,
      ...transformedValues,
    },
    context,
    options
  );

  if (errors) {
    return { errors, values };
  }

  return { errors: {}, values };
};

export const backupResolver: Resolver<LinodeCreateFormValues> = async (
  values,
  context,
  options
) => {
  const transformedValues = getLinodeCreatePayload(values);

  const { errors } = await yupResolver(
    CreateLinodeFromBackupSchema,
    {},
    { mode: 'async', rawValues: true }
  )(transformedValues, context, options);

  if (errors) {
    return { errors, values };
  }

  return { errors: {}, values };
};

export const linodeCreateResolvers: Record<
  LinodeCreateType,
  Resolver<LinodeCreateFormValues>
> = {
  Backups: backupResolver,
  'Clone Linode': cloneResolver,
  Distributions: resolver,
  Images: resolver,
  'One-Click': resolver,
  StackScripts: resolver,
};
