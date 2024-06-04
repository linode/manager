import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import UserSSHKeyPanel from 'src/components/AccessPanel/UserSSHKeyPanel';
import {
  DISK_ENCRYPTION_GENERAL_DESCRIPTION,
  DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY,
} from 'src/components/DiskEncryption/constants';
import { DiskEncryption } from 'src/components/DiskEncryption/DiskEncryption';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/DiskEncryption/utils';
import { Divider } from 'src/components/Divider';
import { Paper } from 'src/components/Paper';
import { Skeleton } from 'src/components/Skeleton';
import { inputMaxWidth } from 'src/foundations/themes/light';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { CreateLinodeRequest } from '@linode/api-v4';

const PasswordInput = React.lazy(
  () => import('src/components/PasswordInput/PasswordInput')
);

export const Access = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const { data: regions } = useRegionsQuery();
  const regionId = useWatch({ control, name: 'region' });

  const selectedRegion = regions?.find((r) => r.id === regionId);

  const regionSupportsDiskEncryption = selectedRegion?.capabilities.includes(
    'Disk Encryption'
  );

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
              onBlur={field.onBlur}
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
      {isDiskEncryptionFeatureEnabled && (
        <>
          <Divider spacingBottom={20} spacingTop={24} />
          <Controller
            render={({ field, fieldState }) => (
              <DiskEncryption
                onChange={(checked) =>
                  field.onChange(checked ? 'enabled' : 'disabled')
                }
                descriptionCopy={DISK_ENCRYPTION_GENERAL_DESCRIPTION}
                disabled={!regionSupportsDiskEncryption}
                disabledReason={DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY}
                error={fieldState.error?.message}
                isEncryptDiskChecked={field.value === 'enabled'}
              />
            )}
            control={control}
            name="disk_encryption"
          />
        </>
      )}
    </Paper>
  );
};
