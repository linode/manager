import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from '@linode/api-v4';
import { RebuildLinodeSchema } from '@linode/validation';
import { boolean, number, object, string } from 'yup';

import { stackscriptQueries } from 'src/queries/stackscripts';

import { getIsUDFRequired } from '../../LinodeCreate/Tabs/StackScripts/UserDefinedFields/utilities';

import type { RebuildRequest, StackScript } from '@linode/api-v4';
import type { ManagerPreferences } from '@linode/utilities';
import type { QueryClient } from '@tanstack/react-query';
import type { FieldError, FieldErrors, Resolver } from 'react-hook-form';

export const REBUILD_OPTIONS = [
  { label: 'Image' },
  { label: 'Community StackScript' },
  { label: 'Account StackScript' },
] as const;

export const REBUILD_LINODE_IMAGE_PARAM_NAME = 'selectedImageId';

export type LinodeRebuildType = typeof REBUILD_OPTIONS[number]['label'];

export interface RebuildLinodeFormValues extends RebuildRequest {
  confirmationText?: string;
  reuseUserData: boolean;
}

export interface Context {
  isTypeToConfirmEnabled: ManagerPreferences['type_to_confirm'];
  linodeLabel: string | undefined;
  queryClient: QueryClient;
  type: LinodeRebuildType;
}

const RebuildLinodeFromImageSchema = RebuildLinodeSchema.concat(
  object({
    confirmationText: string(),
    reuseUserData: boolean().required(),
  })
);

const RebuildLinodeFromStackScriptSchema = RebuildLinodeFromImageSchema.concat(
  object({
    stackscript_id: number().required('You must select a StackScript.'),
  })
);

export const resolver: Resolver<RebuildLinodeFormValues, Context> = async (
  values,
  context,
  options
) => {
  const schema =
    context?.type === 'Image'
      ? RebuildLinodeFromImageSchema
      : RebuildLinodeFromStackScriptSchema;

  const { errors } = await yupResolver(schema, {}, {})(
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

  if (context && values.stackscript_id) {
    const stackscript = context.queryClient.getQueryData<StackScript>(
      stackscriptQueries.stackscript(values.stackscript_id).queryKey
    );

    if (stackscript) {
      const stackScriptErrors: Record<string, FieldError> = {};

      for (const udf of stackscript.user_defined_fields) {
        const stackscriptData = values.stackscript_data as
          | Record<string, string>
          | null
          | undefined;

        if (getIsUDFRequired(udf) && !stackscriptData?.[udf.name]) {
          stackScriptErrors[udf.name] = {
            message: `${udf.label} is required.`,
            type: 'required',
          };
        }
      }

      if (!isEmpty(stackScriptErrors)) {
        (errors as FieldErrors<RebuildLinodeFormValues>)[
          'stackscript_data'
        ] = stackScriptErrors;
      }
    }
  }

  if (errors) {
    return { errors, values };
  }

  return { errors: {}, values };
};
