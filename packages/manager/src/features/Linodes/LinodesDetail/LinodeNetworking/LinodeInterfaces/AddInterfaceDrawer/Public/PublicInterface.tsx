import { Notice } from '@linode/ui';
import React from 'react'
import { useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';

import type { CreateInterfaceFormValues } from '../utilities';

/**
 * Currently, the user can't do any configuration when they create their
 * Public interface. This component exists just to surface errors right now.
 */
export const PublicInterface = () => {
  const { formState: { errors } } = useFormContext<CreateInterfaceFormValues>();

  const publicIPv4Error = errors.public?.ipv4?.addresses?.[0]?.message;

  if (!publicIPv4Error) {
    return null;
  }

  return (
    <Notice variant='error'>
      <ErrorMessage message={publicIPv4Error} />
    </Notice>
  );
};