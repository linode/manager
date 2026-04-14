import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { UserSSHKeyPanel } from 'src/components/AccessPanel/UserSSHKeyPanel';
import { useIsPasswordLessLinodesEnabled } from 'src/utilities/linodes';

import type { RebuildLinodeFormValues } from './utils';

interface Props {
  disabled: boolean;
}

export const SSHKeys = (props: Props) => {
  const { control, trigger } = useFormContext<RebuildLinodeFormValues>();
  const { isPasswordLessLinodesEnabled } = useIsPasswordLessLinodesEnabled();

  return (
    <Controller
      control={control}
      name="authorized_users"
      render={({ field }) => (
        <UserSSHKeyPanel
          authorizedUsers={field.value ?? []}
          disabled={props.disabled}
          headingVariant="h3"
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
