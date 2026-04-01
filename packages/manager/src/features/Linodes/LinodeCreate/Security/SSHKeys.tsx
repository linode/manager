import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { UserSSHKeyPanel } from 'src/components/AccessPanel/UserSSHKeyPanel';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useIsPasswordLessLinodesEnabled } from 'src/utilities/linodes';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const SSHKeys = () => {
  const { control, trigger } = useFormContext<CreateLinodeRequest>();
  const { data: permissions } = usePermissions('account', ['create_linode']);
  const { isPasswordLessLinodesEnabled } = useIsPasswordLessLinodesEnabled();

  return (
    <Controller
      control={control}
      name="authorized_users"
      render={({ field }) => (
        <UserSSHKeyPanel
          authorizedUsers={field.value ?? []}
          disabled={!permissions.create_linode}
          setAuthorizedUsers={(values) => {
            field.onChange(values);
            if (isPasswordLessLinodesEnabled) {
              trigger('root_pass');
            }
          }}
        />
      )}
    />
  );
};
