import { Notice } from '@linode/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const LinodeCreateError = () => {
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
    <Notice spacingBottom={0} spacingTop={0} variant="error">
      <ErrorMessage
        entity={{ type: 'linode_id' }}
        formPayloadValues={{ type: values.type }}
        message={generalError}
      />
    </Notice>
  );
};
