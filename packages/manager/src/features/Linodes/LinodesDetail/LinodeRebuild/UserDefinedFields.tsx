import { Box, Notice, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { ShowMoreExpansion } from 'src/components/ShowMoreExpansion';
import { useStackScriptQuery } from 'src/queries/stackscripts';

import { UserDefinedFieldInput } from '../../LinodeCreate/Tabs/StackScripts/UserDefinedFields/UserDefinedFieldInput';
import { separateUDFsByRequiredStatus } from '../../LinodeCreate/Tabs/StackScripts/UserDefinedFields/utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const UserDefinedFields = () => {
  const { control, formState } = useFormContext<CreateLinodeRequest>();

  const stackscriptId = useWatch({
    control,
    name: 'stackscript_id',
  });

  const hasStackscriptSelected =
    stackscriptId !== null && stackscriptId !== undefined;

  const { data: stackscript } = useStackScriptQuery(
    stackscriptId ?? -1,
    hasStackscriptSelected
  );

  const userDefinedFields = stackscript?.user_defined_fields;

  const [requiredUDFs, optionalUDFs] = separateUDFsByRequiredStatus(
    userDefinedFields
  );

  if (!stackscript || userDefinedFields?.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h2">{stackscript.label} Setup</Typography>
      {formState.errors.stackscript_data?.message && (
        <Notice
          text={formState.errors.stackscript_data.message as string}
          variant="error"
        />
      )}
      <Stack spacing={2}>
        {requiredUDFs.map((field) => (
          <UserDefinedFieldInput key={field.name} userDefinedField={field} />
        ))}
      </Stack>
      <Box>
        {optionalUDFs.length !== 0 && (
          <ShowMoreExpansion defaultExpanded name="Advanced Options">
            <Stack spacing={1}>
              <Typography py={1}>
                These fields are additional configuration options and are not
                required for creation.
              </Typography>
              <Stack spacing={2}>
                {optionalUDFs.map((field) => (
                  <UserDefinedFieldInput
                    key={field.name}
                    userDefinedField={field}
                  />
                ))}
              </Stack>
            </Stack>
          </ShowMoreExpansion>
        )}
      </Box>
    </Stack>
  );
};
