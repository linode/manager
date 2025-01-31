import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Encryption } from 'src/components/Encryption/Encryption';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';

import type { RebuildLinodeFormValues } from './utils';

export const DiskEncryption = () => {
  const { control } = useFormContext<RebuildLinodeFormValues>();

  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  if (!isDiskEncryptionFeatureEnabled) {
    return false;
  }

  return (
    <Controller
      render={({ field, fieldState }) => (
        <Encryption
          onChange={(checked) =>
            field.onChange(checked ? 'enabled' : 'disabled')
          }
          descriptionCopy="Secure this Linode using data at rest encryption."
          disabledReason=""
          error={fieldState.error?.message}
          isEncryptEntityChecked={field.value === 'enabled'}
        />
      )}
      control={control}
      name="disk_encryption"
    />
  );
};
