import React from 'react';
import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Error = () => {
  const {
    formState: { errors },
    getValues,
  } = useFormContext<CreateLinodeRequest>();

  const generalError = errors.root?.message ?? errors.interfaces?.message;
  const values = getValues();

  if (!generalError) {
    return null;
  }

  return (
    <Paper sx={{ p: 0 }}>
      <Notice spacingBottom={0} spacingTop={0} variant="error">
        <ErrorMessage
          entity={{ type: 'linode_id' }}
          formPayloadValues={{ type: values.type }}
          message={generalError}
        />
      </Notice>
    </Paper>
  );
};
