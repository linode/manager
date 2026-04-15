import { useRegionsQuery } from '@linode/queries';
import { Divider, Paper, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  DISK_ENCRYPTION_DEFAULT_DISTRIBUTED_INSTANCES,
  DISK_ENCRYPTION_DISTRIBUTED_DESCRIPTION,
  DISK_ENCRYPTION_GENERAL_DESCRIPTION,
  DISK_ENCRYPTION_UNAVAILABLE_IN_REGION_COPY,
} from 'src/components/Encryption/constants';
import { Encryption } from 'src/components/Encryption/Encryption';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { useIsPasswordLessLinodesEnabled } from 'src/utilities/linodes';

import { Password } from './Password';
import { SSHKeys } from './SSHKeys';

import type { CreateLinodeRequest } from '@linode/api-v4';

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

  const { isPasswordLessLinodesEnabled } = useIsPasswordLessLinodesEnabled();

  return (
    <Paper>
      <Typography sx={{ mb: 2 }} variant="h2">
        Security
      </Typography>
      {!isPasswordLessLinodesEnabled ? (
        <>
          <Password />
          <Divider spacingBottom={20} spacingTop={24} />
          <SSHKeys />
        </>
      ) : (
        <>
          <SSHKeys />
          <Divider spacingBottom={20} spacingTop={24} />
          <Password />
        </>
      )}
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
