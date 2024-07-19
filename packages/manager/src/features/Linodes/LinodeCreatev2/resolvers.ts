import { yupResolver } from '@hookform/resolvers/yup';
import { CreateLinodeSchema } from '@linode/validation';

import {
  CreateLinodeByCloningSchema,
  CreateLinodeFromBackupSchema,
  CreateLinodeFromMarketplaceAppSchema,
  CreateLinodeFromStackScriptSchema,
} from './schemas';
import { getLinodeCreatePayload } from './utilities';

import type { LinodeCreateType } from '../LinodesCreate/types';
import type { LinodeCreateFormValues } from './utilities';
import type { Resolver } from 'react-hook-form';

export const resolver: Resolver<LinodeCreateFormValues> = async (
  values,
  context,
  options
) => {
  const transformedValues = getLinodeCreatePayload(structuredClone(values));

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

export const stackscriptResolver: Resolver<LinodeCreateFormValues> = async (
  values,
  context,
  options
) => {
  const transformedValues = getLinodeCreatePayload(structuredClone(values));

  const { errors } = await yupResolver(
    CreateLinodeFromStackScriptSchema,
    {},
    { mode: 'async', rawValues: true }
  )(transformedValues, context, options);

  if (errors) {
    return { errors, values };
  }

  return { errors: {}, values };
};

export const marketplaceResolver: Resolver<LinodeCreateFormValues> = async (
  values,
  context,
  options
) => {
  const transformedValues = getLinodeCreatePayload(structuredClone(values));

  const { errors } = await yupResolver(
    CreateLinodeFromMarketplaceAppSchema,
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
  const transformedValues = getLinodeCreatePayload(structuredClone(values));

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
  const transformedValues = getLinodeCreatePayload(structuredClone(values));

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
  Images: resolver,
  OS: resolver,
  'One-Click': marketplaceResolver,
  StackScripts: stackscriptResolver,
};
