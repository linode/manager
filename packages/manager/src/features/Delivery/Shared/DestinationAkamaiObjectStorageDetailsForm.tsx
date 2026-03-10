import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  Autocomplete,
  Box,
  Divider,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@linode/ui';
import { capitalize, FormControlLabel } from '@mui/material';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { HideShowText } from 'src/components/PasswordInput/HideShowText';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { PathSample } from 'src/features/Delivery/Shared/PathSample';
import { useFlags } from 'src/hooks/useFlags';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';

import type { FormMode, FormType } from 'src/features/Delivery/Shared/types';

interface DestinationLinodeObjectStorageDetailsFormProps {
  controlPaths?: {
    accessKeyId: string;
    accessKeySecret: string;
    bucketName: string;
    host: string;
    path: string;
  };
  entity: FormType;
  mode: FormMode;
}

const defaultPaths = {
  accessKeyId: 'details.access_key_id',
  accessKeySecret: 'details.access_key_secret',
  bucketName: 'details.bucket_name',
  host: 'details.host',
  path: 'details.path',
};

export const DestinationAkamaiObjectStorageDetailsForm = ({
  controlPaths = defaultPaths,
  entity,
  mode,
}: DestinationLinodeObjectStorageDetailsFormProps) => {
  const { gecko2 } = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(gecko2?.enabled, gecko2?.la);

  const { data: regions, isPending: areRegionsLoading } = useRegionsQuery();
  const { data: objectStorageBucketsResponse, isPending: areBucketsLoading } =
    useObjectStorageBuckets();
  const objectStorageBuckets = objectStorageBucketsResponse?.buckets || [];

  const { control, setValue } = useFormContext();

  const path = useWatch({
    control,
    name: controlPaths?.path,
  });

  const pendoPageId = `Logs Delivery ${capitalize(entity)}s ${capitalize(mode)}${entity === 'destination' ? '' : ' New Destination'}-`;

  const [selectedBucketConfiguration, setSelectedBucketConfiguration] =
    useState(
      mode === 'edit' ? 'bucket_entered_manually' : 'bucket_from_account'
    );
  const [selectedRegion, setSelectedRegion] = useState<null | string>(null);

  const getBucketsForRegion = (regionId: null | string) =>
    regionId
      ? objectStorageBuckets.filter(({ region }) => region === regionId)
      : objectStorageBuckets;

  const buckets = getBucketsForRegion(selectedRegion);

  const clearBucketFields = () => {
    setValue(controlPaths.bucketName, '');
    setValue(controlPaths.host, '');
  };

  const handleRegionChange = (regionId: string | undefined) => {
    const newRegion = regionId || null;
    setSelectedRegion(newRegion);

    if (getBucketsForRegion(newRegion).length === 0) {
      clearBucketFields();
    }
  };

  const handleBucketConfigurationChange = (value: string) => {
    setSelectedBucketConfiguration(value);
    if (value === 'bucket_from_account') {
      clearBucketFields();
      setSelectedRegion(null);
    }
  };

  return (
    <>
      <Typography sx={{ mt: 2 }} variant="h3">
        Bucket
      </Typography>
      <RadioGroup
        onChange={(_, value) => handleBucketConfigurationChange(value)}
        sx={{ '&[role="radiogroup"]': { mb: 0 } }}
        value={selectedBucketConfiguration}
      >
        <FormControlLabel
          control={<Radio />}
          label="Select Bucket associated with the account"
          value="bucket_from_account"
        />
        <FormControlLabel
          control={<Radio />}
          label="Enter Bucket manually"
          value="bucket_entered_manually"
        />
      </RadioGroup>
      {selectedBucketConfiguration === 'bucket_from_account' ? (
        <>
          <RegionSelect
            currentCapability="Object Storage"
            disabled={areRegionsLoading}
            isGeckoLAEnabled={isGeckoLAEnabled}
            label="Region"
            loading={areRegionsLoading}
            onChange={(_, region) => handleRegionChange(region?.id)}
            regionFilter="core"
            regions={regions ?? []}
            textFieldProps={{
              optional: true,
            }}
            value={selectedRegion}
          />
          <Controller
            control={control}
            name={controlPaths.bucketName}
            render={({ field, fieldState }) => (
              <Autocomplete
                aria-required
                disabled={areBucketsLoading}
                errorText={fieldState.error?.message}
                label="Bucket"
                loading={areBucketsLoading}
                onBlur={field.onBlur}
                onChange={(_, bucket) => {
                  field.onChange(bucket?.label || '');
                  setValue(
                    controlPaths?.host,
                    bucket?.s3_endpoint || bucket?.hostname || ''
                  );
                }}
                options={buckets}
                textFieldProps={{
                  inputProps: {
                    'data-pendo-id': `${pendoPageId}Bucket`,
                  },
                }}
                value={
                  buckets.find(({ label }) => label === field.value) ?? null
                }
              />
            )}
          />
        </>
      ) : (
        <Controller
          control={control}
          name={controlPaths.bucketName}
          render={({ field, fieldState }) => (
            <TextField
              aria-required
              errorText={fieldState.error?.message}
              inputProps={{
                'data-pendo-id': `${pendoPageId}Bucket`,
              }}
              label="Bucket"
              onBlur={field.onBlur}
              onChange={(value) => {
                field.onChange(value);
              }}
              value={field.value}
            />
          )}
        />
      )}
      <Controller
        control={control}
        name={controlPaths.host}
        render={({ field, fieldState }) => (
          <TextField
            aria-required
            disabled={selectedBucketConfiguration === 'bucket_from_account'}
            errorText={fieldState.error?.message}
            inputProps={{
              'data-pendo-id': `${pendoPageId}Host`,
            }}
            label="Endpoint"
            onBlur={field.onBlur}
            onChange={(value) => {
              field.onChange(value);
            }}
            placeholder="Endpoint for the destination"
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
            inputProps={{
              'data-pendo-id': `${pendoPageId}Access Key ID`,
            }}
            label="Access Key ID"
            onBlur={field.onBlur}
            onChange={(value) => field.onChange(value)}
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
            inputProps={{
              'data-pendo-id': `${pendoPageId}Secret Access Key`,
            }}
            label="Secret Access Key"
            onBlur={field.onBlur}
            onChange={(value) => field.onChange(value)}
            value={field.value}
          />
        )}
      />
      <Divider sx={{ my: 3 }} />
      <Typography variant="h2">Path</Typography>
      <Box
        alignItems="baseline"
        display="flex"
        flexWrap="wrap"
        gap="16px"
        sx={{ '> *': { width: '100%' } }}
      >
        <Controller
          control={control}
          name={controlPaths.path}
          render={({ field, fieldState }) => (
            <TextField
              aria-required
              errorText={fieldState.error?.message}
              inputProps={{
                'data-pendo-id': `${pendoPageId}Log Path Prefix`,
              }}
              label="Log Path Prefix"
              onBlur={field.onBlur}
              onChange={(value) => field.onChange(value)}
              optional
              placeholder="Prefix for log storage path"
              sx={{ maxWidth: 416 }}
              value={field.value}
            />
          )}
        />
        <PathSample value={path} />
      </Box>
    </>
  );
};
