import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from '@linode/api-v4';
import { stackscriptQueries } from '@linode/queries';
import { RebuildLinodeSchema } from '@linode/validation';
import type { FieldError, FieldErrors, Resolver } from 'react-hook-form';
import { boolean, number, object, string } from 'yup';

import { getIsUDFRequired } from '../../LinodeCreate/Tabs/StackScripts/UserDefinedFields/utilities';

import type { RebuildRequest, StackScript } from '@linode/api-v4';
import type { ManagerPreferences } from '@linode/utilities';
import type { QueryClient } from '@tanstack/react-query';

export const REBUILD_OPTIONS = [
  { label: 'Image' },
  { label: 'Community StackScript' },
  { label: 'Account StackScript' },
] as const;

export const REBUILD_LINODE_IMAGE_PARAM_NAME = 'selectedImageId';

export type LinodeRebuildType = (typeof REBUILD_OPTIONS)[number]['label'];

export interface RebuildLinodeFormValues extends RebuildRequest {
  confirmationText?: string;
  reuseUserData: boolean;
}

export interface Context {
  isPasswordLessLinodesEnabled: boolean;
  isTypeToConfirmEnabled: ManagerPreferences['type_to_confirm'];
  linodeLabel: string | undefined;
  queryClient: QueryClient;
  type: LinodeRebuildType;
}

const RebuildLinodeFromImageWithoutPasswordSchema = RebuildLinodeSchema.concat(
  object({
    confirmationText: string(),
    reuseUserData: boolean().required(),
    root_pass: string().when('authorized_users', {
      is: (value: any) => !Array.isArray(value) || value.length === 0,
      then: (schema) =>
        schema.required(
          'An SSH Key or a Root Password is required to create an instance. We recommend using an SSH Key for better security.'
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
  })
);

const RebuildLinodeFromImageSchema =
  RebuildLinodeFromImageWithoutPasswordSchema.shape({
    root_pass: string().required('Password is required.'),
  });

const RebuildLinodeFromStackScriptWithoutPasswordSchema =
  RebuildLinodeFromImageWithoutPasswordSchema.concat(
    object({
      stackscript_id: number().required('You must select a StackScript.'),
    })
  );

const RebuildLinodeFromStackScriptSchema =
  RebuildLinodeFromStackScriptWithoutPasswordSchema.shape({
    root_pass: string().required('Password is required.'),
  });

const REBUILD_SCHEMAS = {
  image: {
    standard: RebuildLinodeFromImageSchema,
    passwordless: RebuildLinodeFromImageWithoutPasswordSchema,
  },
  stackscript: {
    standard: RebuildLinodeFromStackScriptSchema,
    passwordless: RebuildLinodeFromStackScriptWithoutPasswordSchema,
  },
} as const;

export const resolver: Resolver<RebuildLinodeFormValues, Context> = async (
  values,
  context,
  options
) => {
  const typeKey = context?.type === 'Image' ? 'image' : 'stackscript';
  const passwordKey = context?.isPasswordLessLinodesEnabled
    ? 'passwordless'
    : 'standard';

  const schema = REBUILD_SCHEMAS[typeKey][passwordKey];

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
          | null
          | Record<string, string>
          | undefined;

        if (getIsUDFRequired(udf) && !stackscriptData?.[udf.name]) {
          stackScriptErrors[udf.name] = {
            message: `${udf.label} is required.`,
            type: 'required',
          };
        }
      }

      if (!isEmpty(stackScriptErrors)) {
        (errors as FieldErrors<RebuildLinodeFormValues>)['stackscript_data'] =
          stackScriptErrors;
      }
    }
  }

  if (errors) {
    return { errors, values };
  }

  return { errors: {}, values };
};
