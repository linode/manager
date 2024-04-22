import { CreateLinodeRequest } from '@linode/api-v4';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { Paper } from 'src/components/Paper';
import { ShowMoreExpansion } from 'src/components/ShowMoreExpansion';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useStackScriptQuery } from 'src/queries/stackscripts';

import { UserDefinedFieldInput } from './UserDefinedFieldInput';
import { separateUDFsByRequiredStatus } from './utilities';

export const UserDefinedFields = () => {
  const stackscriptId = useWatch<CreateLinodeRequest, 'stackscript_id'>({
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
    <Paper>
      <Typography variant="h2">{stackscript.label} Setup</Typography>
      {requiredUDFs.map((field) => (
        <UserDefinedFieldInput key={field.name} userDefinedField={field} />
      ))}
      {optionalUDFs.length !== 0 && (
        <ShowMoreExpansion defaultExpanded name="Advanced Options">
          <Stack spacing={1}>
            <Typography>
              These fields are additional configuration options and are not
              required for creation.
            </Typography>
            {optionalUDFs.map((field) => (
              <UserDefinedFieldInput
                key={field.name}
                userDefinedField={field}
              />
            ))}
          </Stack>
        </ShowMoreExpansion>
      )}
    </Paper>
  );
};
