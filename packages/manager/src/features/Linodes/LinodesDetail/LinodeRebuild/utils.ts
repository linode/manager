import { yupResolver } from '@hookform/resolvers/yup';
import { RebuildLinodeSchema } from '@linode/validation';
import { object, string } from 'yup';

import type { RebuildRequest } from '@linode/api-v4';
import type { FieldErrors, Resolver } from 'react-hook-form';
import type { ManagerPreferences } from 'src/types/ManagerPreferences';

export const REBUILD_OPTIONS = [
  { label: 'Image' },
  { label: 'Community StackScript' },
  { label: 'Account StackScript' },
] as const;

export type LinodeRebuildType = typeof REBUILD_OPTIONS[number]['label'];

export interface RebuildLinodeFormValues extends RebuildRequest {
  confirmationText?: string;
}

export interface Context {
  isTypeToConfirmEnabled: ManagerPreferences['type_to_confirm'];
  linodeLabel: string | undefined;
}

const RebuildLinodeFormSchema = RebuildLinodeSchema.concat(
  object({
    confirmationText: string(),
  })
);

export const resolver: Resolver<RebuildLinodeFormValues, Context> = async (
  values,
  context,
  options
) => {
  const { errors } = await yupResolver(RebuildLinodeFormSchema, {}, {})(
    values,
    context,
    options
  );

  if (
    context?.isTypeToConfirmEnabled &&
    values.confirmationText !== context.linodeLabel
  ) {
    (errors as FieldErrors<RebuildLinodeFormValues>)['confirmationText'] = {
      message: `You must type the Linode label (${context.linodeLabel}) to confirm.`,
      type: 'required',
    };
  }

  if (errors) {
    return { errors, values };
  }

  return { errors: {}, values };
};
