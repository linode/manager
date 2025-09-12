import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { Box, Divider, TextField, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { HideShowText } from 'src/components/PasswordInput/HideShowText';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { PathSample } from 'src/features/DataStream/Shared/PathSample';
import { useFlags } from 'src/hooks/useFlags';

interface DestinationLinodeObjectStorageDetailsFormProps {
  controlPaths?: {
    accessKeyId: string;
    accessKeySecret: string;
    bucketName: string;
    host: string;
    path: string;
    region: string;
  };
}

const defaultPaths = {
  accessKeyId: 'details.access_key_id',
  accessKeySecret: 'details.access_key_secret',
  bucketName: 'details.bucket_name',
  host: 'details.host',
  path: 'details.path',
  region: 'details.region',
};

export const DestinationLinodeObjectStorageDetailsForm = ({
  controlPaths = defaultPaths,
}: DestinationLinodeObjectStorageDetailsFormProps) => {
  const { gecko2 } = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(gecko2?.enabled, gecko2?.la);
  const { data: regions } = useRegionsQuery();
  const { control } = useFormContext();

  return (
    <>
      <Controller
        control={control}
        name={controlPaths.host}
        render={({ field, fieldState }) => (
          <TextField
            aria-required
            errorText={fieldState.error?.message}
            label="Host"
            onBlur={field.onBlur}
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
        name={controlPaths.bucketName}
        render={({ field, fieldState }) => (
          <TextField
            aria-required
            errorText={fieldState.error?.message}
            label="Bucket"
            onBlur={field.onBlur}
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
        name={controlPaths.region}
        render={({ field, fieldState }) => (
          <RegionSelect
            currentCapability="Object Storage"
            disableClearable
            errorText={fieldState.error?.message}
            isGeckoLAEnabled={isGeckoLAEnabled}
            label="Region"
            onBlur={field.onBlur}
            onChange={(_, region) => field.onChange(region.id)}
            regionFilter="core"
            regions={regions ?? []}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name={controlPaths.accessKeyId}
        render={({ field, fieldState }) => (
          <HideShowText
            aria-required
            errorText={fieldState.error?.message}
            label="Access Key ID"
            onBlur={field.onBlur}
            onChange={(value) => field.onChange(value)}
            placeholder="Access Key ID..."
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name={controlPaths.accessKeySecret}
        render={({ field, fieldState }) => (
          <HideShowText
            aria-required
            errorText={fieldState.error?.message}
            label="Secret Access Key"
            onBlur={field.onBlur}
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
          name={controlPaths.path}
          render={({ field, fieldState }) => (
            <TextField
              aria-required
              errorText={fieldState.error?.message}
              label="Log Path Prefix"
              onBlur={field.onBlur}
              onChange={(value) => field.onChange(value)}
              placeholder="Log Path Prefix..."
              sx={{ width: 416 }}
              value={field.value}
            />
          )}
        />
        <PathSample
          value="text-cloud/logs/audit/02/26/2026" // TODO: Generate sample path value in DPS-34666
        />
      </Box>
    </>
  );
};
