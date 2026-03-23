import { Notice, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Skeleton } from 'src/components/Skeleton';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useIsPasswordLessLinodesEnabled } from 'src/utilities/linodes';

import type { CreateLinodeRequest } from '@linode/api-v4';

const PasswordInput = React.lazy(() =>
  import('src/components/PasswordInput/PasswordInput').then((module) => ({
    default: module.PasswordInput,
  }))
);

export const Password = () => {
  const { control, formState } = useFormContext<CreateLinodeRequest>();
  const { data: permissions } = usePermissions('account', ['create_linode']);
  const { isPasswordLessLinodesEnabled } = useIsPasswordLessLinodesEnabled();

  return (
    <>
      {isPasswordLessLinodesEnabled && (
        <>
          <Typography mb={2} variant="h2">
            Authentication Method
          </Typography>
          {formState.errors.root_pass?.message && (
            <Notice text={formState.errors.root_pass.message} variant="error" />
          )}
        </>
      )}
      <React.Suspense
        fallback={
          <Skeleton
            sx={(theme) => ({ height: '89px', maxWidth: theme.inputMaxWidth })}
          />
        }
      >
        <Controller
          control={control}
          name="root_pass"
          render={({ field, fieldState }) => (
            <PasswordInput
              autoComplete="off"
              disabled={!permissions.create_linode}
              errorText={
                !isPasswordLessLinodesEnabled
                  ? fieldState.error?.message
                  : undefined
              }
              id="linode-password"
              label="Root Password"
              name="password"
              noMarginTop
              onBlur={field.onBlur}
              onChange={field.onChange}
              placeholder="Enter a password."
              value={field.value ?? ''}
            />
          )}
        />
      </React.Suspense>
    </>
  );
};
