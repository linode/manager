import { useRegionQuery } from '@linode/queries';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Encryption } from 'src/components/Encryption/Encryption';
import {
  getDiskEncryptionDisabledInRebuildReason,
  getRebuildDiskEncryptionDescription,
  useIsDiskEncryptionFeatureEnabled,
} from 'src/components/Encryption/utils';

import type { RebuildLinodeFormValues } from './utils';

interface Props {
  disabled: boolean;
  isLKELinode: boolean;
  linodeRegion: string;
}

export const DiskEncryption = (props: Props) => {
  const { disabled, isLKELinode, linodeRegion } = props;
  const { control } = useFormContext<RebuildLinodeFormValues>();

  const { data: region } = useRegionQuery(linodeRegion);

  const isLinodeInDistributedRegion = region?.site_type === 'distributed';
  const regionSupportsDiskEncryption =
    region?.capabilities.includes('Disk Encryption') ?? false;

  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  if (!isDiskEncryptionFeatureEnabled && !regionSupportsDiskEncryption) {
    return null;
  }

  const disableDiskEncryptionReason = getDiskEncryptionDisabledInRebuildReason({
    isLKELinode,
    isLinodeInDistributedRegion,
    regionSupportsDiskEncryption,
  });

  const description = getRebuildDiskEncryptionDescription({
    isLKELinode,
    isLinodeInDistributedRegion,
  });

  return (
    <Controller
      render={({ field, fieldState }) => (
        <Encryption
          onChange={(checked) =>
            field.onChange(checked ? 'enabled' : 'disabled')
          }
          descriptionCopy={description}
          disabled={disabled || disableDiskEncryptionReason !== undefined}
          disabledReason={disableDiskEncryptionReason}
          error={fieldState.error?.message}
          isEncryptEntityChecked={field.value === 'enabled'}
        />
      )}
      control={control}
      name="disk_encryption"
    />
  );
};
