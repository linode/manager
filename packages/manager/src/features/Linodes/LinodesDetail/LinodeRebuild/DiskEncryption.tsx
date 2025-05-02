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

  // "Disk Encryption" indicates general availability and "LA Disk Encryption" indicates limited availability
  const regionSupportsDiskEncryption =
    (region?.capabilities.includes('Disk Encryption') ||
      region?.capabilities.includes('LA Disk Encryption')) ??
    false;

  const { isDiskEncryptionFeatureEnabled } =
    useIsDiskEncryptionFeatureEnabled();

  if (!isDiskEncryptionFeatureEnabled) {
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
      control={control}
      name="disk_encryption"
      render={({ field, fieldState }) => (
        <Encryption
          descriptionCopy={description}
          disabled={disabled || disableDiskEncryptionReason !== undefined}
          disabledReason={disableDiskEncryptionReason}
          error={fieldState.error?.message}
          isEncryptEntityChecked={field.value === 'enabled'}
          onChange={(checked) =>
            field.onChange(checked ? 'enabled' : 'disabled')
          }
        />
      )}
    />
  );
};
