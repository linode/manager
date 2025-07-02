import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { Box, Divider, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { HideShowText } from 'src/components/PasswordInput/HideShowText';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { PathSample } from 'src/features/DataStream/Shared/PathSample';
import { useFlags } from 'src/hooks/useFlags';

export const DestinationLinodeObjectStorageDetailsForm = () => {
  const { gecko2 } = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(gecko2?.enabled, gecko2?.la);
  const { data: regions } = useRegionsQuery();
  const { control } = useFormContext();

  return (
    <>
      <Controller
        control={control}
        name="host"
        render={({ field }) => (
          <TextField
            aria-required
            label="Host"
            onChange={(value) => {
              field.onChange(value);
            }}
            placeholder="Host..."
            value={field.value}
          />
        )}
        rules={{ required: true }}
      />
      <Controller
        control={control}
        name="bucket_name"
        render={({ field }) => (
          <TextField
            aria-required
            label="Bucket"
            onChange={(value) => {
              field.onChange(value);
            }}
            placeholder="Bucket..."
            value={field.value}
          />
        )}
        rules={{ required: true }}
      />
      <Controller
        control={control}
        name="region"
        render={({ field }) => (
          <RegionSelect
            currentCapability="Object Storage"
            disableClearable
            isGeckoLAEnabled={isGeckoLAEnabled}
            label="Region"
            onChange={(_, region) => field.onChange(region.id)}
            regionFilter="core"
            regions={regions ?? []}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="access_key_id"
        render={({ field }) => (
          <HideShowText
            aria-required
            label="Access Key ID"
            onChange={(value) => field.onChange(value)}
            placeholder="Access Key ID..."
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="access_key_secret"
        render={({ field }) => (
          <HideShowText
            aria-required
            label="Secret Access Key"
            onChange={(value) => field.onChange(value)}
            placeholder="Secret Access Key..."
            value={field.value}
          />
        )}
      />
      <Divider sx={{ my: 3 }} />
      <Typography variant="h2">Path</Typography>
      <Box alignItems="end" display="flex" flexWrap="wrap" gap="16px">
        <Controller
          control={control}
          name="path"
          render={({ field }) => (
            <TextField
              aria-required
              label="Log Path Prefix"
              onChange={(value) => field.onChange(value)}
              placeholder="Log Path Prefix..."
              value={field.value}
            />
          )}
        />
        <PathSample
          value="text-cloud/logs/audit/02/26/2026" // TODO: Generate sample path value in DPS-33654
        />
      </Box>
    </>
  );
};
