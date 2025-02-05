import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { UserSSHKeyPanel } from 'src/components/AccessPanel/UserSSHKeyPanel';

import type { RebuildLinodeFormValues } from './utils';

export const SSHKeys = () => {
  const { control } = useFormContext<RebuildLinodeFormValues>();

  return (
    <Controller
      render={({ field }) => (
        <UserSSHKeyPanel
          authorizedUsers={field.value ?? []}
          setAuthorizedUsers={field.onChange}
        />
      )}
      control={control}
      name="authorized_users"
    />
  );
};
