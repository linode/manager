import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import UserSSHKeyPanel from 'src/components/AccessPanel/UserSSHKeyPanel';
import { Divider } from 'src/components/Divider';
import { Paper } from 'src/components/Paper';
import { Skeleton } from 'src/components/Skeleton';
import { inputMaxWidth } from 'src/foundations/themes/light';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { CreateLinodeRequest } from '@linode/api-v4';

const PasswordInput = React.lazy(
  () => import('src/components/PasswordInput/PasswordInput')
);

export const Access = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  return (
    <Paper>
      <React.Suspense
        fallback={<Skeleton sx={{ height: '89px', maxWidth: inputMaxWidth }} />}
      >
        <Controller
          render={({ field, fieldState }) => (
            <PasswordInput
              autoComplete="off"
              disabled={isLinodeCreateRestricted}
              errorText={fieldState.error?.message}
              label="Root Password"
              name="password"
              noMarginTop
              onChange={field.onChange}
              placeholder="Enter a password."
              value={field.value ?? ''}
            />
          )}
          control={control}
          name="root_pass"
        />
      </React.Suspense>
      <Divider spacingBottom={20} spacingTop={24} />
      <Controller
        render={({ field }) => (
          <UserSSHKeyPanel
            authorizedUsers={field.value ?? []}
            disabled={isLinodeCreateRestricted}
            setAuthorizedUsers={field.onChange}
          />
        )}
        control={control}
        name="authorized_users"
      />
    </Paper>
  );
};
