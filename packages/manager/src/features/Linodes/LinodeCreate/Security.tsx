import { useRegionsQuery } from '@linode/queries';
import { Divider, Paper, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { UserSSHKeyPanel } from 'src/components/AccessPanel/UserSSHKeyPanel';
import {
  DISK_ENCRYPTION_DEFAULT_DISTRIBUTED_INSTANCES,
  DISK_ENCRYPTION_DISTRIBUTED_DESCRIPTION,
  DISK_ENCRYPTION_GENERAL_DESCRIPTION,
  DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY,
} from 'src/components/Encryption/constants';
import { Encryption } from 'src/components/Encryption/Encryption';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { Skeleton } from 'src/components/Skeleton';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { CreateLinodeRequest } from '@linode/api-v4';

const PasswordInput = React.lazy(() =>
  import('src/components/PasswordInput/PasswordInput').then((module) => ({
    default: module.PasswordInput,
  }))
);

export const Security = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const { isDiskEncryptionFeatureEnabled } =
    useIsDiskEncryptionFeatureEnabled();

  const { data: regions } = useRegionsQuery();
  const regionId = useWatch({ control, name: 'region' });

  const selectedRegion = regions?.find((r) => r.id === regionId);

  // "Disk Encryption" indicates general availability and "LA Disk Encryption" indicates limited availability
  const regionSupportsDiskEncryption =
    selectedRegion?.capabilities.includes('Disk Encryption') ||
    selectedRegion?.capabilities.includes('LA Disk Encryption');

  const isDistributedRegion = getIsDistributedRegion(
    regions ?? [],
    selectedRegion?.id ?? ''
  );

  const { permissions } = usePermissions('account', ['create_linode']);

  return (
    <Paper>
      <Typography sx={{ mb: 2 }} variant="h2">
        Security
      </Typography>
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
              errorText={fieldState.error?.message}
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
      <Divider spacingBottom={20} spacingTop={24} />
      <Controller
        control={control}
        name="authorized_users"
        render={({ field }) => (
          <UserSSHKeyPanel
            authorizedUsers={field.value ?? []}
            disabled={!permissions.create_linode}
            setAuthorizedUsers={field.onChange}
          />
        )}
      />
      {isDiskEncryptionFeatureEnabled && (
        <>
          <Divider spacingBottom={20} spacingTop={24} />
          <Controller
            control={control}
            name="disk_encryption"
            render={({ field, fieldState }) => (
              <Encryption
                descriptionCopy={
                  isDistributedRegion
                    ? DISK_ENCRYPTION_DISTRIBUTED_DESCRIPTION
                    : DISK_ENCRYPTION_GENERAL_DESCRIPTION
                }
                disabled={isDistributedRegion || !regionSupportsDiskEncryption}
                disabledReason={
                  isDistributedRegion
                    ? DISK_ENCRYPTION_DEFAULT_DISTRIBUTED_INSTANCES
                    : DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY
                }
                error={fieldState.error?.message}
                isEncryptEntityChecked={
                  isDistributedRegion || field.value === 'enabled'
                }
                onChange={(checked) =>
                  field.onChange(checked ? 'enabled' : 'disabled')
                }
                sxCheckbox={{ paddingLeft: '0px' }}
              />
            )}
          />
        </>
      )}
    </Paper>
  );
};
